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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
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

    /* src/Time.svelte generated by Svelte v3.37.0 */
    const file$2 = "src/Time.svelte";

    // (19:2) {#if parseInt(hours) > 0}
    function create_if_block$2(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(/*hours*/ ctx[1]);
    			t1 = text("h");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hours*/ 2) set_data_dev(t0, /*hours*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(19:2) {#if parseInt(hours) > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let b;
    	let show_if = parseInt(/*hours*/ ctx[1]) > 0;
    	let t0;
    	let t1;
    	let t2;
    	let if_block = show_if && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			b = element("b");
    			if (if_block) if_block.c();
    			t0 = space();
    			t1 = text(/*minutes*/ ctx[0]);
    			t2 = text("m");
    			this.c = noop;
    			add_location(b, file$2, 17, 0, 437);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			if (if_block) if_block.m(b, null);
    			append_dev(b, t0);
    			append_dev(b, t1);
    			append_dev(b, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hours*/ 2) show_if = parseInt(/*hours*/ ctx[1]) > 0;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(b, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*minutes*/ 1) set_data_dev(t1, /*minutes*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("octoprint-card-time", slots, []);
    	let { seconds } = $$props;
    	let minutes;
    	let hours;

    	afterUpdate(() => {
    		$$invalidate(0, minutes = twoDidgetNumber(seconds / 60 % 60));
    		$$invalidate(1, hours = twoDidgetNumber(seconds / 60 / 60));
    	});

    	const twoDidgetNumber = number => number.toLocaleString("en-US", {
    		minimumIntegerDigits: 2,
    		maximumFractionDigits: 0,
    		useGrouping: false
    	});

    	const writable_props = ["seconds"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<octoprint-card-time> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("seconds" in $$props) $$invalidate(2, seconds = $$props.seconds);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		seconds,
    		minutes,
    		hours,
    		twoDidgetNumber
    	});

    	$$self.$inject_state = $$props => {
    		if ("seconds" in $$props) $$invalidate(2, seconds = $$props.seconds);
    		if ("minutes" in $$props) $$invalidate(0, minutes = $$props.minutes);
    		if ("hours" in $$props) $$invalidate(1, hours = $$props.hours);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [minutes, hours, seconds];
    }

    class Time extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{ seconds: 2 }
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*seconds*/ ctx[2] === undefined && !("seconds" in props)) {
    			console.warn("<octoprint-card-time> was created without expected prop 'seconds'");
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
    		return ["seconds"];
    	}

    	get seconds() {
    		return this.$$.ctx[2];
    	}

    	set seconds(seconds) {
    		this.$set({ seconds });
    		flush();
    	}
    }

    customElements.define("octoprint-card-time", Time);

    /* src/Preview.svelte generated by Svelte v3.37.0 */
    const file$1 = "src/Preview.svelte";

    // (49:4) {#if timeElapsed && timeRemaining}
    function create_if_block$1(ctx) {
    	let div0;
    	let time0;
    	let updating_seconds;
    	let t0;
    	let span0;
    	let t2;
    	let div1;
    	let time1;
    	let updating_seconds_1;
    	let t3;
    	let span1;
    	let current;

    	function time0_seconds_binding(value) {
    		/*time0_seconds_binding*/ ctx[6](value);
    	}

    	let time0_props = {};

    	if (/*timeElapsed*/ ctx[1] !== void 0) {
    		time0_props.seconds = /*timeElapsed*/ ctx[1];
    	}

    	time0 = new Time({ props: time0_props, $$inline: true });
    	binding_callbacks.push(() => bind(time0, "seconds", time0_seconds_binding));

    	function time1_seconds_binding(value) {
    		/*time1_seconds_binding*/ ctx[7](value);
    	}

    	let time1_props = {};

    	if (/*timeRemaining*/ ctx[2] !== void 0) {
    		time1_props.seconds = /*timeRemaining*/ ctx[2];
    	}

    	time1 = new Time({ props: time1_props, $$inline: true });
    	binding_callbacks.push(() => bind(time1, "seconds", time1_seconds_binding));

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(time0.$$.fragment);
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Elapsed";
    			t2 = space();
    			div1 = element("div");
    			create_component(time1.$$.fragment);
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Remaining";
    			add_location(span0, file$1, 51, 8, 1801);
    			attr_dev(div0, "class", "elapsed");
    			add_location(div0, file$1, 49, 6, 1727);
    			add_location(span1, file$1, 55, 8, 1919);
    			attr_dev(div1, "class", "remaining");
    			add_location(div1, file$1, 53, 6, 1841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(time0, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(time1, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, span1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const time0_changes = {};

    			if (!updating_seconds && dirty & /*timeElapsed*/ 2) {
    				updating_seconds = true;
    				time0_changes.seconds = /*timeElapsed*/ ctx[1];
    				add_flush_callback(() => updating_seconds = false);
    			}

    			time0.$set(time0_changes);
    			const time1_changes = {};

    			if (!updating_seconds_1 && dirty & /*timeRemaining*/ 4) {
    				updating_seconds_1 = true;
    				time1_changes.seconds = /*timeRemaining*/ ctx[2];
    				add_flush_callback(() => updating_seconds_1 = false);
    			}

    			time1.$set(time1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(time0.$$.fragment, local);
    			transition_in(time1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(time0.$$.fragment, local);
    			transition_out(time1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(time0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			destroy_component(time1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(49:4) {#if timeElapsed && timeRemaining}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
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
    	let img;
    	let img_src_value;
    	let t5;
    	let div1;
    	let t6;
    	let div4;
    	let div2;
    	let b2;
    	let t7_value = /*state*/ ctx[0].toolActual?.value + "";
    	let t7;
    	let t8_value = /*state*/ ctx[0].toolActual?.unit + "";
    	let t8;
    	let t9;
    	let t10_value = /*state*/ ctx[0].toolTarget?.value + "";
    	let t10;
    	let t11_value = /*state*/ ctx[0].toolActual?.unit + "";
    	let t11;
    	let t12;
    	let span0;
    	let t14;
    	let div3;
    	let b3;
    	let t15_value = /*state*/ ctx[0].bedActual?.value + "";
    	let t15;
    	let t16_value = /*state*/ ctx[0].toolActual?.unit + "";
    	let t16;
    	let t17;
    	let t18_value = /*state*/ ctx[0].bedTarget?.value + "";
    	let t18;
    	let t19_value = /*state*/ ctx[0].toolActual?.unit + "";
    	let t19;
    	let t20;
    	let span1;
    	let t22;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*timeElapsed*/ ctx[1] && /*timeRemaining*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			b0 = element("b");
    			t0 = text(t0_value);
    			t1 = space();
    			b1 = element("b");
    			t2 = text(t2_value);
    			t3 = text("%");
    			t4 = space();
    			div0 = element("div");
    			img = element("img");
    			t5 = space();
    			div1 = element("div");
    			t6 = space();
    			div4 = element("div");
    			div2 = element("div");
    			b2 = element("b");
    			t7 = text(t7_value);
    			t8 = text(t8_value);
    			t9 = text(" /\n        ");
    			t10 = text(t10_value);
    			t11 = text(t11_value);
    			t12 = space();
    			span0 = element("span");
    			span0.textContent = "Tool Temperatrue";
    			t14 = space();
    			div3 = element("div");
    			b3 = element("b");
    			t15 = text(t15_value);
    			t16 = text(t16_value);
    			t17 = text(" /\n        ");
    			t18 = text(t18_value);
    			t19 = text(t19_value);
    			t20 = space();
    			span1 = element("span");
    			span1.textContent = "Bed Temperature";
    			t22 = space();
    			if (if_block) if_block.c();
    			this.c = noop;
    			attr_dev(b0, "class", "current-state");
    			add_location(b0, file$1, 27, 2, 938);
    			attr_dev(b1, "class", "print-percentage");
    			add_location(b1, file$1, 28, 2, 990);
    			if (img.src !== (img_src_value = /*mediaSource*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Representation or your 3D Printer");
    			add_location(img, file$1, 30, 4, 1097);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$1, 29, 2, 1047);
    			attr_dev(div1, "class", "progress");
    			set_style(div1, "--percentage", /*state*/ ctx[0].jobPercentage + "%");
    			add_location(div1, file$1, 32, 2, 1174);
    			add_location(b2, file$1, 35, 6, 1297);
    			add_location(span0, file$1, 39, 6, 1436);
    			attr_dev(div2, "class", "tool");
    			add_location(div2, file$1, 34, 4, 1272);
    			add_location(b3, file$1, 42, 6, 1505);
    			add_location(span1, file$1, 46, 6, 1642);
    			attr_dev(div3, "class", "bed");
    			add_location(div3, file$1, 41, 4, 1481);
    			attr_dev(div4, "class", "sensors");
    			add_location(div4, file$1, 33, 2, 1246);
    			attr_dev(div5, "class", "preview");
    			add_location(div5, file$1, 26, 0, 914);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, b0);
    			append_dev(b0, t0);
    			append_dev(div5, t1);
    			append_dev(div5, b1);
    			append_dev(b1, t2);
    			append_dev(b1, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div0);
    			append_dev(div0, img);
    			append_dev(div5, t5);
    			append_dev(div5, div1);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, b2);
    			append_dev(b2, t7);
    			append_dev(b2, t8);
    			append_dev(b2, t9);
    			append_dev(b2, t10);
    			append_dev(b2, t11);
    			append_dev(div2, t12);
    			append_dev(div2, span0);
    			append_dev(div4, t14);
    			append_dev(div4, div3);
    			append_dev(div3, b3);
    			append_dev(b3, t15);
    			append_dev(b3, t16);
    			append_dev(b3, t17);
    			append_dev(b3, t18);
    			append_dev(b3, t19);
    			append_dev(div3, t20);
    			append_dev(div3, span1);
    			append_dev(div4, t22);
    			if (if_block) if_block.m(div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*toggleSource*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*state*/ 1) && t0_value !== (t0_value = /*state*/ ctx[0].currentState + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*state*/ 1) && t2_value !== (t2_value = /*state*/ ctx[0].jobPercentage + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*mediaSource*/ 8 && img.src !== (img_src_value = /*mediaSource*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*state*/ 1) {
    				set_style(div1, "--percentage", /*state*/ ctx[0].jobPercentage + "%");
    			}

    			if ((!current || dirty & /*state*/ 1) && t7_value !== (t7_value = /*state*/ ctx[0].toolActual?.value + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*state*/ 1) && t8_value !== (t8_value = /*state*/ ctx[0].toolActual?.unit + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*state*/ 1) && t10_value !== (t10_value = /*state*/ ctx[0].toolTarget?.value + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*state*/ 1) && t11_value !== (t11_value = /*state*/ ctx[0].toolActual?.unit + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty & /*state*/ 1) && t15_value !== (t15_value = /*state*/ ctx[0].bedActual?.value + "")) set_data_dev(t15, t15_value);
    			if ((!current || dirty & /*state*/ 1) && t16_value !== (t16_value = /*state*/ ctx[0].toolActual?.unit + "")) set_data_dev(t16, t16_value);
    			if ((!current || dirty & /*state*/ 1) && t18_value !== (t18_value = /*state*/ ctx[0].bedTarget?.value + "")) set_data_dev(t18, t18_value);
    			if ((!current || dirty & /*state*/ 1) && t19_value !== (t19_value = /*state*/ ctx[0].toolActual?.unit + "")) set_data_dev(t19, t19_value);

    			if (/*timeElapsed*/ ctx[1] && /*timeRemaining*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*timeElapsed, timeRemaining*/ 6) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
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
    	let { image } = $$props;
    	let timeElapsed;
    	let timeRemaining;
    	let mediaSource;
    	let streamWasSet;

    	afterUpdate(() => {
    		var _a;
    		$$invalidate(1, timeElapsed = state.timeElapsed && parseInt(state.timeElapsed));
    		$$invalidate(2, timeRemaining = state.timeRemaining && parseInt(state.timeRemaining));

    		const stream = (_a = state.cameraStream) === null || _a === void 0
    		? void 0
    		: _a.replace("camera_proxy", "camera_proxy_stream");

    		$$invalidate(3, mediaSource = streamWasSet ? mediaSource : stream || image);
    	});

    	const toggleSource = () => {
    		var _a;
    		streamWasSet = true;

    		const stream = (_a = state.cameraStream) === null || _a === void 0
    		? void 0
    		: _a.replace("camera_proxy", "camera_proxy_stream");

    		$$invalidate(3, mediaSource = mediaSource.includes("camera_proxy") ? image : stream);
    	};

    	const writable_props = ["state", "image"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<octoprint-card-preview> was created with unknown prop '${key}'`);
    	});

    	function time0_seconds_binding(value) {
    		timeElapsed = value;
    		$$invalidate(1, timeElapsed);
    	}

    	function time1_seconds_binding(value) {
    		timeRemaining = value;
    		$$invalidate(2, timeRemaining);
    	}

    	$$self.$$set = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("image" in $$props) $$invalidate(5, image = $$props.image);
    	};

    	$$self.$capture_state = () => ({
    		Time,
    		afterUpdate,
    		state,
    		image,
    		timeElapsed,
    		timeRemaining,
    		mediaSource,
    		streamWasSet,
    		toggleSource
    	});

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("image" in $$props) $$invalidate(5, image = $$props.image);
    		if ("timeElapsed" in $$props) $$invalidate(1, timeElapsed = $$props.timeElapsed);
    		if ("timeRemaining" in $$props) $$invalidate(2, timeRemaining = $$props.timeRemaining);
    		if ("mediaSource" in $$props) $$invalidate(3, mediaSource = $$props.mediaSource);
    		if ("streamWasSet" in $$props) streamWasSet = $$props.streamWasSet;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		state,
    		timeElapsed,
    		timeRemaining,
    		mediaSource,
    		toggleSource,
    		image,
    		time0_seconds_binding,
    		time1_seconds_binding
    	];
    }

    class Preview extends SvelteElement {
    	constructor(options) {
    		super();

    		this.shadowRoot.innerHTML = `<style>.preview{background:var(--primary-color);border-radius:var(--ha-card-border-radius, 4px)
      var(--ha-card-border-radius, 4px) 0 0;color:var(--text-primary-color);display:grid;grid-template-areas:"state percentage"
      "content content"
      "progress progress"
      "sensors sensors"}.current-state{grid-area:state;padding:1rem}.print-percentage{grid-area:percentage;text-align:right;padding:1rem}.sensors{display:flex;border-top:1px solid rgba(255, 255, 255, 0.4);grid-area:sensors}.sensors>div{padding:1rem;text-align:center;flex-grow:1}.sensors>div>span{display:block}.sensors>div+div{border-left:1px solid rgba(255, 255, 255, 0.4)}.content{grid-area:content;display:flex;align-items:center;justify-content:center;padding:1rem;cursor:pointer}img{max-width:90%;max-height:300px}.progress{position:relative;grid-area:progress;height:5px;width:var(--percentage);background-color:rgba(255, 255, 255, 0.7);transition:width 0.5s}</style>`;

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
    			{ state: 0, image: 5 }
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*image*/ ctx[5] === undefined && !("image" in props)) {
    			console.warn("<octoprint-card-preview> was created without expected prop 'image'");
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
    		return ["state", "image"];
    	}

    	get state() {
    		return this.$$.ctx[0];
    	}

    	set state(state) {
    		this.$set({ state });
    		flush();
    	}

    	get image() {
    		return this.$$.ctx[5];
    	}

    	set image(image) {
    		this.$set({ image });
    		flush();
    	}
    }

    customElements.define("octoprint-card-preview", Preview);

    /* src/OctoprintCard.svelte generated by Svelte v3.37.0 */

    const { Object: Object_1 } = globals;
    const file = "src/OctoprintCard.svelte";

    // (50:4) {#if config.octoPrintUrl}
    function create_if_block(ctx) {
    	let a;
    	let ha_icon;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			ha_icon = element("ha-icon");
    			set_custom_element_data(ha_icon, "icon", "mdi:link-variant");
    			add_location(ha_icon, file, 51, 9, 2605);
    			attr_dev(a, "href", a_href_value = /*config*/ ctx[1].octoPrintUrl);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 50, 6, 2550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, ha_icon);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config*/ 2 && a_href_value !== (a_href_value = /*config*/ ctx[1].octoPrintUrl)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(50:4) {#if config.octoPrintUrl}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let ha_card;
    	let octoprint_card_preview;
    	let octoprint_card_preview_image_value;
    	let t;
    	let div;
    	let if_block = /*config*/ ctx[1].octoPrintUrl && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			ha_card = element("ha-card");
    			octoprint_card_preview = element("octoprint-card-preview");
    			t = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			this.c = noop;
    			set_custom_element_data(octoprint_card_preview, "state", /*state*/ ctx[0]);
    			set_custom_element_data(octoprint_card_preview, "image", octoprint_card_preview_image_value = /*config*/ ctx[1].imageUrl);
    			add_location(octoprint_card_preview, file, 47, 2, 2431);
    			attr_dev(div, "class", "actions");
    			add_location(div, file, 48, 2, 2492);
    			set_custom_element_data(ha_card, "class", "parent");
    			add_location(ha_card, file, 46, 0, 2404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ha_card, anchor);
    			append_dev(ha_card, octoprint_card_preview);
    			append_dev(ha_card, t);
    			append_dev(ha_card, div);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state*/ 1) {
    				set_custom_element_data(octoprint_card_preview, "state", /*state*/ ctx[0]);
    			}

    			if (dirty & /*config*/ 2 && octoprint_card_preview_image_value !== (octoprint_card_preview_image_value = /*config*/ ctx[1].imageUrl)) {
    				set_custom_element_data(octoprint_card_preview, "image", octoprint_card_preview_image_value);
    			}

    			if (/*config*/ ctx[1].octoPrintUrl) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ha_card);
    			if (if_block) if_block.d();
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
    		$$invalidate(1, config = Object.assign({}, conf));
    		const entity = config.entity;

    		$$invalidate(2, entityMatch = entity === null || entity === void 0
    		? void 0
    		: entity.substring(entity.lastIndexOf(".") + 1, entity.lastIndexOf("_")));
    	}

    	afterUpdate(() => {
    		if (hass) {
    			$$invalidate(0, state = {
    				bedActual: {
    					value: hass.states[config === null || config === void 0
    					? void 0
    					: config.bedActual].state,
    					unit: hass.states[config === null || config === void 0
    					? void 0
    					: config.bedActual].attributes.unit_of_measurement
    				},
    				bedTarget: {
    					value: hass.states[config === null || config === void 0
    					? void 0
    					: config.bedTarget].state,
    					unit: hass.states[config === null || config === void 0
    					? void 0
    					: config.bedTarget].attributes.unit_of_measurement
    				},
    				toolActual: {
    					value: hass.states[config === null || config === void 0
    					? void 0
    					: config.toolActual].state,
    					unit: hass.states[config === null || config === void 0
    					? void 0
    					: config.toolActual].attributes.unit_of_measurement
    				},
    				toolTarget: {
    					value: hass.states[config === null || config === void 0
    					? void 0
    					: config.toolTarget].state,
    					unit: hass.states[config === null || config === void 0
    					? void 0
    					: config.toolTarget].attributes.unit_of_measurement
    				},
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
    				: config.printing].state,
    				cameraStream: hass.states[config === null || config === void 0
    				? void 0
    				: config.videoSource].attributes.entity_picture
    			});

    			hass.callApi;
    		}
    	});

    	const writable_props = ["hass", "state", "entityMatch"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<octoprint-card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("hass" in $$props) $$invalidate(3, hass = $$props.hass);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("entityMatch" in $$props) $$invalidate(2, entityMatch = $$props.entityMatch);
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
    		if ("hass" in $$props) $$invalidate(3, hass = $$props.hass);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("entityMatch" in $$props) $$invalidate(2, entityMatch = $$props.entityMatch);
    		if ("config" in $$props) $$invalidate(1, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, config, entityMatch, hass, setConfig];
    }

    class OctoprintCard extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.actions{padding:0.5rem}</style>`;

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
    				hass: 3,
    				state: 0,
    				entityMatch: 2,
    				setConfig: 4
    			}
    		);

    		const { ctx } = this.$$;
    		const props = this.attributes;

    		if (/*hass*/ ctx[3] === undefined && !("hass" in props)) {
    			console.warn("<octoprint-card> was created without expected prop 'hass'");
    		}

    		if (/*entityMatch*/ ctx[2] === undefined && !("entityMatch" in props)) {
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
    		return this.$$.ctx[3];
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
    		return this.$$.ctx[2];
    	}

    	set entityMatch(entityMatch) {
    		this.$set({ entityMatch });
    		flush();
    	}

    	get setConfig() {
    		return this.$$.ctx[4];
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
