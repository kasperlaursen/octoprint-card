(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OctoprintCard = factory());
}(this, (function () { 'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                const { on_mount } = this.$$;
                this.$$.on_disconnect = on_mount.map(run).filter(is_function);
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            disconnectedCallback() {
                run_all(this.$$.on_disconnect);
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    /* src/Preview.svelte generated by Svelte v3.37.0 */

    const file$1 = "src/Preview.svelte";

    function create_fragment$1(ctx) {
    	let div4;
    	let b0;
    	let t0_value = /*state*/ ctx[0].currentState + "";
    	let t0;
    	let t1;
    	let b1;
    	let t2_value = /*state*/ ctx[0].jobPercentage + "";
    	let t2;
    	let t3;
    	let t4;
    	let div0;
    	let span0;
    	let t6;
    	let b2;
    	let t7_value = /*state*/ ctx[0].toolActual + "";
    	let t7;
    	let t8;
    	let t9_value = /*state*/ ctx[0].toolTarget + "";
    	let t9;
    	let t10;
    	let t11;
    	let div1;
    	let span1;
    	let t13;
    	let b3;
    	let t14_value = /*state*/ ctx[0].bedActual + "";
    	let t14;
    	let t15;
    	let t16_value = /*state*/ ctx[0].bedTarget + "";
    	let t16;
    	let t17;
    	let t18;
    	let div2;
    	let ha_icon0;
    	let t19;
    	let span2;
    	let t20_value = /*state*/ ctx[0].timeElapsed + "";
    	let t20;
    	let t21;
    	let t22;
    	let div3;
    	let ha_icon1;
    	let t23;
    	let span3;
    	let t24_value = /*state*/ ctx[0].timeRemaining + "";
    	let t24;
    	let t25;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			b0 = element("b");
    			t0 = text(t0_value);
    			t1 = space();
    			b1 = element("b");
    			t2 = text(t2_value);
    			t3 = text("%");
    			t4 = space();
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Tool:";
    			t6 = space();
    			b2 = element("b");
    			t7 = text(t7_value);
    			t8 = text("°C / ");
    			t9 = text(t9_value);
    			t10 = text("°C");
    			t11 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "Bed:";
    			t13 = space();
    			b3 = element("b");
    			t14 = text(t14_value);
    			t15 = text("°C / ");
    			t16 = text(t16_value);
    			t17 = text("°C");
    			t18 = space();
    			div2 = element("div");
    			ha_icon0 = element("ha-icon");
    			t19 = space();
    			span2 = element("span");
    			t20 = text(t20_value);
    			t21 = text(" Elapsed");
    			t22 = space();
    			div3 = element("div");
    			ha_icon1 = element("ha-icon");
    			t23 = space();
    			span3 = element("span");
    			t24 = text(t24_value);
    			t25 = text(" Remaining");
    			this.c = noop;
    			attr_dev(b0, "class", "current-state");
    			add_location(b0, file$1, 7, 2, 127);
    			attr_dev(b1, "class", "print-percentage");
    			add_location(b1, file$1, 8, 2, 179);
    			add_location(span0, file$1, 10, 4, 259);
    			add_location(b2, file$1, 11, 4, 282);
    			attr_dev(div0, "class", "tool");
    			add_location(div0, file$1, 9, 2, 236);
    			add_location(span1, file$1, 14, 4, 366);
    			add_location(b3, file$1, 15, 4, 388);
    			attr_dev(div1, "class", "bed");
    			add_location(div1, file$1, 13, 2, 344);
    			set_custom_element_data(ha_icon0, "icon", "mdi:clock-start");
    			add_location(ha_icon0, file$1, 18, 4, 474);
    			add_location(span2, file$1, 19, 4, 513);
    			attr_dev(div2, "class", "elapsed");
    			add_location(div2, file$1, 17, 2, 448);
    			set_custom_element_data(ha_icon1, "icon", "mdi:clock-end");
    			add_location(ha_icon1, file$1, 22, 4, 593);
    			add_location(span3, file$1, 23, 4, 630);
    			attr_dev(div3, "class", "remaining");
    			add_location(div3, file$1, 21, 2, 565);
    			attr_dev(div4, "class", "preview");
    			add_location(div4, file$1, 6, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, b0);
    			append_dev(b0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, b1);
    			append_dev(b1, t2);
    			append_dev(b1, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t6);
    			append_dev(div0, b2);
    			append_dev(b2, t7);
    			append_dev(b2, t8);
    			append_dev(b2, t9);
    			append_dev(b2, t10);
    			append_dev(div4, t11);
    			append_dev(div4, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t13);
    			append_dev(div1, b3);
    			append_dev(b3, t14);
    			append_dev(b3, t15);
    			append_dev(b3, t16);
    			append_dev(b3, t17);
    			append_dev(div4, t18);
    			append_dev(div4, div2);
    			append_dev(div2, ha_icon0);
    			append_dev(div2, t19);
    			append_dev(div2, span2);
    			append_dev(span2, t20);
    			append_dev(span2, t21);
    			append_dev(div4, t22);
    			append_dev(div4, div3);
    			append_dev(div3, ha_icon1);
    			append_dev(div3, t23);
    			append_dev(div3, span3);
    			append_dev(span3, t24);
    			append_dev(span3, t25);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state*/ 1 && t0_value !== (t0_value = /*state*/ ctx[0].currentState + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*state*/ 1 && t2_value !== (t2_value = /*state*/ ctx[0].jobPercentage + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*state*/ 1 && t7_value !== (t7_value = /*state*/ ctx[0].toolActual + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*state*/ 1 && t9_value !== (t9_value = /*state*/ ctx[0].toolTarget + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*state*/ 1 && t14_value !== (t14_value = /*state*/ ctx[0].bedActual + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*state*/ 1 && t16_value !== (t16_value = /*state*/ ctx[0].bedTarget + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*state*/ 1 && t20_value !== (t20_value = /*state*/ ctx[0].timeElapsed + "")) set_data_dev(t20, t20_value);
    			if (dirty & /*state*/ 1 && t24_value !== (t24_value = /*state*/ ctx[0].timeRemaining + "")) set_data_dev(t24, t24_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("octoprint-card-preview", slots, []);
    	
    	let { state = {} } = $$props;
    	const writable_props = ["state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<octoprint-card-preview> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({ state });

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state];
    }

    class Preview extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>.preview{background:var(--primary-color);border-radius:var(--ha-card-border-radius, 4px)
      var(--ha-card-border-radius, 4px) 0 0;padding:4px;color:var(--text-primary-color)}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{ state: 0 }
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["state"];
    	}

    	get state() {
    		return this.$$.ctx[0];
    	}

    	set state(state) {
    		this.$set({ state });
    		flush();
    	}
    }

    customElements.define("octoprint-card-preview", Preview);

    /* src/OctoprintCard.svelte generated by Svelte v3.37.0 */

    const { Object: Object_1 } = globals;
    const file = "src/OctoprintCard.svelte";

    function create_fragment(ctx) {
    	let ha_card;
    	let octoprint_card_preview;
    	let t;

    	const block = {
    		c: function create() {
    			ha_card = element("ha-card");
    			octoprint_card_preview = element("octoprint-card-preview");
    			t = text("\n  Actions goes here!");
    			this.c = noop;
    			set_custom_element_data(octoprint_card_preview, "state", /*state*/ ctx[0]);
    			add_location(octoprint_card_preview, file, 34, 2, 1608);
    			set_custom_element_data(ha_card, "class", "parent");
    			add_location(ha_card, file, 33, 0, 1581);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ha_card, anchor);
    			append_dev(ha_card, octoprint_card_preview);
    			append_dev(ha_card, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state*/ 1) {
    				set_custom_element_data(octoprint_card_preview, "state", /*state*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ha_card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("octoprint-card", slots, []);
    	
    	
    	let { hass } = $$props;
    	let { state = {} } = $$props;
    	let { entityMatch } = $$props;
    	let config = {};

    	function setConfig(conf = {}) {
    		config = Object.assign({}, conf);
    		const entity = config.entity;

    		$$invalidate(1, entityMatch = entity === null || entity === void 0
    		? void 0
    		: entity.substring(entity.lastIndexOf(".") + 1, entity.lastIndexOf("_")));
    	}

    	afterUpdate(() => {
    		if (hass) {
    			$$invalidate(0, state = {
    				bedActual: hass.states[config === null || config === void 0
    				? void 0
    				: config.bedActual].state,
    				bedTarget: hass.states[config === null || config === void 0
    				? void 0
    				: config.bedTarget].state,
    				toolActual: hass.states[config === null || config === void 0
    				? void 0
    				: config.toolActual].state,
    				toolTarget: hass.states[config === null || config === void 0
    				? void 0
    				: config.toolTarget].state,
    				currentState: hass.states[config === null || config === void 0
    				? void 0
    				: config.currentState].state,
    				timeElapsed: hass.states[config === null || config === void 0
    				? void 0
    				: config.timeElapsed].state,
    				timeRemaining: hass.states[config === null || config === void 0
    				? void 0
    				: config.timeRemaining].state,
    				jobPercentage: hass.states[config === null || config === void 0
    				? void 0
    				: config.jobPercentage].state,
    				printing: hass.states[config === null || config === void 0
    				? void 0
    				: config.printing].state
    			});

    			hass.callApi;
    		}
    	});

    	const writable_props = ["hass", "state", "entityMatch"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<octoprint-card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("hass" in $$props) $$invalidate(2, hass = $$props.hass);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("entityMatch" in $$props) $$invalidate(1, entityMatch = $$props.entityMatch);
    	};

    	$$self.$capture_state = () => ({
    		Preview,
    		afterUpdate,
    		hass,
    		state,
    		entityMatch,
    		config,
    		setConfig
    	});

    	$$self.$inject_state = $$props => {
    		if ("hass" in $$props) $$invalidate(2, hass = $$props.hass);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("entityMatch" in $$props) $$invalidate(1, entityMatch = $$props.entityMatch);
    		if ("config" in $$props) config = $$props.config;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, entityMatch, hass, setConfig];
    }

    class OctoprintCard extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				hass: 2,
    				state: 0,
    				entityMatch: 1,
    				setConfig: 3
    			}
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*hass*/ ctx[2] === undefined && !("hass" in props)) {
    			console.warn("<octoprint-card> was created without expected prop 'hass'");
    		}

    		if (/*entityMatch*/ ctx[1] === undefined && !("entityMatch" in props)) {
    			console.warn("<octoprint-card> was created without expected prop 'entityMatch'");
    		}

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["hass", "state", "entityMatch", "setConfig"];
    	}

    	get hass() {
    		return this.$$.ctx[2];
    	}

    	set hass(hass) {
    		this.$set({ hass });
    		flush();
    	}

    	get state() {
    		return this.$$.ctx[0];
    	}

    	set state(state) {
    		this.$set({ state });
    		flush();
    	}

    	get entityMatch() {
    		return this.$$.ctx[1];
    	}

    	set entityMatch(entityMatch) {
    		this.$set({ entityMatch });
    		flush();
    	}

    	get setConfig() {
    		return this.$$.ctx[3];
    	}

    	set setConfig(value) {
    		throw new Error("<octoprint-card>: Cannot set read-only property 'setConfig'");
    	}
    }

    customElements.define("octoprint-card", OctoprintCard);

    window.customCards = window.customCards || [];
    window.customCards.push({
        type: "octoprint-card",
        name: "Octoprint Card",
        preview: false,
        description: "Octoprint card",
    });

    return OctoprintCard;

})));
//# sourceMappingURL=octoprint-card.js.map
