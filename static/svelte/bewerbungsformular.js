
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
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
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
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
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div33;
    	let div3;
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let t2;
    	let div4;
    	let input0;
    	let t3;
    	let input1;
    	let t4;
    	let input2;
    	let t5;
    	let input3;
    	let t6;
    	let input4;
    	let t7;
    	let input5;
    	let t8;
    	let input6;
    	let t9;
    	let input7;
    	let t10;
    	let div29;
    	let div7;
    	let span0;
    	let t12;
    	let div5;
    	let textarea0;
    	let t13;
    	let div6;
    	let t15;
    	let div10;
    	let span1;
    	let t17;
    	let div8;
    	let textarea1;
    	let t18;
    	let div9;
    	let t20;
    	let div13;
    	let span2;
    	let t22;
    	let div11;
    	let textarea2;
    	let t23;
    	let div12;
    	let t25;
    	let div16;
    	let span3;
    	let t27;
    	let div14;
    	let textarea3;
    	let t28;
    	let div15;
    	let t30;
    	let div19;
    	let span4;
    	let t32;
    	let div17;
    	let textarea4;
    	let t33;
    	let div18;
    	let t35;
    	let div22;
    	let span5;
    	let t37;
    	let div20;
    	let textarea5;
    	let t38;
    	let div21;
    	let t40;
    	let div25;
    	let span6;
    	let t42;
    	let div23;
    	let textarea6;
    	let t43;
    	let div24;
    	let t45;
    	let div28;
    	let span7;
    	let t47;
    	let div26;
    	let textarea7;
    	let t48;
    	let div27;
    	let t50;
    	let div31;
    	let div30;
    	let input8;
    	let t51;
    	let span8;
    	let t52;
    	let a;
    	let t54;
    	let t55;
    	let button;
    	let t57;
    	let div32;
    	let p;

    	const block = {
    		c: function create() {
    			div33 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Bewerbungsformular";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t2 = space();
    			div4 = element("div");
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			input2 = element("input");
    			t5 = space();
    			input3 = element("input");
    			t6 = space();
    			input4 = element("input");
    			t7 = space();
    			input5 = element("input");
    			t8 = space();
    			input6 = element("input");
    			t9 = space();
    			input7 = element("input");
    			t10 = space();
    			div29 = element("div");
    			div7 = element("div");
    			span0 = element("span");
    			span0.textContent = "Ich bin tätig im/in Korrektorat/Lektorat/Redaktion seit:";
    			t12 = space();
    			div5 = element("div");
    			textarea0 = element("textarea");
    			t13 = space();
    			div6 = element("div");
    			div6.textContent = "0/500 Zeichen";
    			t15 = space();
    			div10 = element("div");
    			span1 = element("span");
    			span1.textContent = "Meine relevanten Qualifikationen:";
    			t17 = space();
    			div8 = element("div");
    			textarea1 = element("textarea");
    			t18 = space();
    			div9 = element("div");
    			div9.textContent = "0/500 Zeichen";
    			t20 = space();
    			div13 = element("div");
    			span2 = element("span");
    			span2.textContent = "Meine relevanten beruflichen Erfahrungen (bitte mit Dauer und Arbeit-/Auftraggeber):";
    			t22 = space();
    			div11 = element("div");
    			textarea2 = element("textarea");
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "0/500 Zeichen";
    			t25 = space();
    			div16 = element("div");
    			span3 = element("span");
    			span3.textContent = "Mein wissenschaftliches Fachgebiet (gerne auch mehrere):";
    			t27 = space();
    			div14 = element("div");
    			textarea3 = element("textarea");
    			t28 = space();
    			div15 = element("div");
    			div15.textContent = "0/500 Zeichen";
    			t30 = space();
    			div19 = element("div");
    			span4 = element("span");
    			span4.textContent = "Diese Art von Aufträgen entsprechen absolut meinem Stärken-und-Vorlieben-Profil:";
    			t32 = space();
    			div17 = element("div");
    			textarea4 = element("textarea");
    			t33 = space();
    			div18 = element("div");
    			div18.textContent = "0/500 Zeichen";
    			t35 = space();
    			div22 = element("div");
    			span5 = element("span");
    			span5.textContent = "Diese Art von Aufträgen kann ich übernehmen, aber nicht bevorzugt:";
    			t37 = space();
    			div20 = element("div");
    			textarea5 = element("textarea");
    			t38 = space();
    			div21 = element("div");
    			div21.textContent = "0/500 Zeichen";
    			t40 = space();
    			div25 = element("div");
    			span6 = element("span");
    			span6.textContent = "Diese Art von Aufträgen lehne ich strikt ab:";
    			t42 = space();
    			div23 = element("div");
    			textarea6 = element("textarea");
    			t43 = space();
    			div24 = element("div");
    			div24.textContent = "0/500 Zeichen";
    			t45 = space();
    			div28 = element("div");
    			span7 = element("span");
    			span7.textContent = "Sonstiges:";
    			t47 = space();
    			div26 = element("div");
    			textarea7 = element("textarea");
    			t48 = space();
    			div27 = element("div");
    			div27.textContent = "0/500 Zeichen";
    			t50 = space();
    			div31 = element("div");
    			div30 = element("div");
    			input8 = element("input");
    			t51 = space();
    			span8 = element("span");
    			t52 = text("mit\n\t\t\t\t");
    			a = element("a");
    			a.textContent = "Datenschutzerklärung";
    			t54 = text("\n\t\t\t\teinverstanden");
    			t55 = space();
    			button = element("button");
    			button.textContent = "Absenden";
    			t57 = space();
    			div32 = element("div");
    			p = element("p");
    			p.textContent = "* Ihre gesamten Angaben werden absolut vertraulich behandelt und ausschließlich für die möglichst effiziente Weitergabe und Erfüllung von\n\t\t\tKundenaufträgen sowie für Abrechnungen verwendet. Eine Verwendung außerhalb dieser Zwecke ist ausgeschlossen, wenn der Netzwerkpartner dieser nicht\n\t\t\tzuvor schriftlich (Email) zugestimmt hat. Der Austausch von Daten innerhalb des Netzwerkes – etwa von einem Netzwerkpartner zum anderen – ist ohne\n\t\t\tschriftliche Zustimmung ebenfalls ausgeschlossen. Eine Weitergabe von Daten der Netzwerkpartner an externe Dritte (z.B. Kunden) ist auch mit\n\t\t\tZustimmung des Partners ausgeschlossen. Ausgenommen hiervon sind berechtigte bzw. berechtigt erscheinende behördliche Ersuchen. Aus der Bewerbung\n\t\t\tfür die freibe Mitarbeit bei lectonet entstehen für keine Seite rechtliche Ansprüche. Weder ist lectonet zur Auftragsweitergabe verpflichtet noch\n\t\t\tbesteht für einen Netzwerkpartner die Pflicht zur Auftragsannahme. Das Ausscheiden eines Partners aus dem lectonet-Netzwerk bedeutet die Löschung\n\t\t\tder Daten nach sechs Monaten. Dieses Ausscheiden bedarf der Schriftform einer Seite.";
    			attr_dev(div0, "class", "wrapper-header-title svelte-g4gued");
    			add_location(div0, file, 5, 2, 74);
    			attr_dev(div1, "class", "icon-close svelte-g4gued");
    			attr_dev(div1, "id", "close-bewerbungsformular");
    			add_location(div1, file, 7, 3, 169);
    			attr_dev(div2, "class", "wrapper-header-x svelte-g4gued");
    			add_location(div2, file, 6, 2, 135);
    			attr_dev(div3, "class", "wrapper-header svelte-g4gued");
    			add_location(div3, file, 4, 1, 43);
    			attr_dev(input0, "placeholder", "Name");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-g4gued");
    			add_location(input0, file, 11, 2, 282);
    			attr_dev(input1, "placeholder", "Vorname");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-g4gued");
    			add_location(input1, file, 12, 2, 325);
    			attr_dev(input2, "placeholder", "Staße");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-g4gued");
    			add_location(input2, file, 13, 2, 371);
    			attr_dev(input3, "placeholder", "Hausnummer");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "svelte-g4gued");
    			add_location(input3, file, 14, 2, 415);
    			attr_dev(input4, "placeholder", "PLZ");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "svelte-g4gued");
    			add_location(input4, file, 15, 2, 464);
    			attr_dev(input5, "placeholder", "Ort");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "svelte-g4gued");
    			add_location(input5, file, 16, 2, 506);
    			attr_dev(input6, "placeholder", "E-Mail Adresse");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "svelte-g4gued");
    			add_location(input6, file, 17, 2, 548);
    			attr_dev(input7, "placeholder", "Telfonnummer");
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "class", "svelte-g4gued");
    			add_location(input7, file, 18, 2, 601);
    			attr_dev(div4, "class", "wrapper-personal-info svelte-g4gued");
    			add_location(div4, file, 10, 1, 244);
    			attr_dev(span0, "class", "label svelte-g4gued");
    			add_location(span0, file, 22, 3, 727);
    			attr_dev(textarea0, "class", "svelte-g4gued");
    			add_location(textarea0, file, 24, 4, 841);
    			attr_dev(div5, "class", "textarea svelte-g4gued");
    			add_location(div5, file, 23, 3, 814);
    			attr_dev(div6, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div6, file, 26, 3, 867);
    			attr_dev(div7, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div7, file, 21, 2, 693);
    			attr_dev(span1, "class", "label svelte-g4gued");
    			add_location(span1, file, 29, 3, 964);
    			attr_dev(textarea1, "class", "svelte-g4gued");
    			add_location(textarea1, file, 31, 4, 1055);
    			attr_dev(div8, "class", "textarea svelte-g4gued");
    			add_location(div8, file, 30, 3, 1028);
    			attr_dev(div9, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div9, file, 33, 3, 1081);
    			attr_dev(div10, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div10, file, 28, 2, 930);
    			attr_dev(span2, "class", "label svelte-g4gued");
    			add_location(span2, file, 36, 3, 1178);
    			attr_dev(textarea2, "class", "svelte-g4gued");
    			add_location(textarea2, file, 38, 4, 1321);
    			attr_dev(div11, "class", "textarea svelte-g4gued");
    			add_location(div11, file, 37, 3, 1294);
    			attr_dev(div12, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div12, file, 40, 3, 1347);
    			attr_dev(div13, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div13, file, 35, 2, 1144);
    			attr_dev(span3, "class", "label svelte-g4gued");
    			add_location(span3, file, 43, 3, 1444);
    			attr_dev(textarea3, "class", "svelte-g4gued");
    			add_location(textarea3, file, 45, 4, 1558);
    			attr_dev(div14, "class", "textarea svelte-g4gued");
    			add_location(div14, file, 44, 3, 1531);
    			attr_dev(div15, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div15, file, 47, 3, 1584);
    			attr_dev(div16, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div16, file, 42, 2, 1410);
    			attr_dev(span4, "class", "label svelte-g4gued");
    			add_location(span4, file, 50, 3, 1681);
    			attr_dev(textarea4, "class", "svelte-g4gued");
    			add_location(textarea4, file, 52, 4, 1819);
    			attr_dev(div17, "class", "textarea svelte-g4gued");
    			add_location(div17, file, 51, 3, 1792);
    			attr_dev(div18, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div18, file, 54, 3, 1845);
    			attr_dev(div19, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div19, file, 49, 2, 1647);
    			attr_dev(span5, "class", "label svelte-g4gued");
    			add_location(span5, file, 57, 3, 1942);
    			attr_dev(textarea5, "class", "svelte-g4gued");
    			add_location(textarea5, file, 59, 4, 2066);
    			attr_dev(div20, "class", "textarea svelte-g4gued");
    			add_location(div20, file, 58, 3, 2039);
    			attr_dev(div21, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div21, file, 61, 3, 2092);
    			attr_dev(div22, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div22, file, 56, 2, 1908);
    			attr_dev(span6, "class", "label svelte-g4gued");
    			add_location(span6, file, 64, 3, 2189);
    			attr_dev(textarea6, "class", "svelte-g4gued");
    			add_location(textarea6, file, 66, 4, 2291);
    			attr_dev(div23, "class", "textarea svelte-g4gued");
    			add_location(div23, file, 65, 3, 2264);
    			attr_dev(div24, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div24, file, 68, 3, 2317);
    			attr_dev(div25, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div25, file, 63, 2, 2155);
    			attr_dev(span7, "class", "label svelte-g4gued");
    			add_location(span7, file, 71, 3, 2414);
    			attr_dev(textarea7, "class", "svelte-g4gued");
    			add_location(textarea7, file, 73, 4, 2482);
    			attr_dev(div26, "class", "textarea svelte-g4gued");
    			add_location(div26, file, 72, 3, 2455);
    			attr_dev(div27, "class", "wrapper-char-limit svelte-g4gued");
    			add_location(div27, file, 75, 3, 2508);
    			attr_dev(div28, "class", "wrapper-textarea svelte-g4gued");
    			add_location(div28, file, 70, 2, 2380);
    			attr_dev(div29, "class", "wrapper-textareas svelte-g4gued");
    			add_location(div29, file, 20, 1, 659);
    			attr_dev(input8, "type", "checkbox");
    			attr_dev(input8, "class", "checkbox svelte-g4gued");
    			set_style(input8, "cursor", "pointer");
    			attr_dev(input8, "name", "checkbox");
    			add_location(input8, file, 80, 3, 2643);
    			attr_dev(a, "href", "/datenschutz");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 83, 4, 2748);
    			add_location(span8, file, 81, 3, 2729);
    			attr_dev(div30, "class", "wrapper-checkbox svelte-g4gued");
    			add_location(div30, file, 79, 2, 2609);
    			attr_dev(button, "class", "btn outline svelte-g4gued");
    			add_location(button, file, 87, 2, 2852);
    			attr_dev(div31, "class", "wrapper-submit svelte-g4gued");
    			add_location(div31, file, 78, 1, 2578);
    			attr_dev(p, "class", "disclaimer-text svelte-g4gued");
    			add_location(p, file, 90, 2, 2943);
    			attr_dev(div32, "class", "wrapper-disclaimer`");
    			add_location(div32, file, 89, 1, 2907);
    			attr_dev(div33, "class", "wrapper svelte-g4gued");
    			add_location(div33, file, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div33, anchor);
    			append_dev(div33, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div33, t2);
    			append_dev(div33, div4);
    			append_dev(div4, input0);
    			append_dev(div4, t3);
    			append_dev(div4, input1);
    			append_dev(div4, t4);
    			append_dev(div4, input2);
    			append_dev(div4, t5);
    			append_dev(div4, input3);
    			append_dev(div4, t6);
    			append_dev(div4, input4);
    			append_dev(div4, t7);
    			append_dev(div4, input5);
    			append_dev(div4, t8);
    			append_dev(div4, input6);
    			append_dev(div4, t9);
    			append_dev(div4, input7);
    			append_dev(div33, t10);
    			append_dev(div33, div29);
    			append_dev(div29, div7);
    			append_dev(div7, span0);
    			append_dev(div7, t12);
    			append_dev(div7, div5);
    			append_dev(div5, textarea0);
    			append_dev(div7, t13);
    			append_dev(div7, div6);
    			append_dev(div29, t15);
    			append_dev(div29, div10);
    			append_dev(div10, span1);
    			append_dev(div10, t17);
    			append_dev(div10, div8);
    			append_dev(div8, textarea1);
    			append_dev(div10, t18);
    			append_dev(div10, div9);
    			append_dev(div29, t20);
    			append_dev(div29, div13);
    			append_dev(div13, span2);
    			append_dev(div13, t22);
    			append_dev(div13, div11);
    			append_dev(div11, textarea2);
    			append_dev(div13, t23);
    			append_dev(div13, div12);
    			append_dev(div29, t25);
    			append_dev(div29, div16);
    			append_dev(div16, span3);
    			append_dev(div16, t27);
    			append_dev(div16, div14);
    			append_dev(div14, textarea3);
    			append_dev(div16, t28);
    			append_dev(div16, div15);
    			append_dev(div29, t30);
    			append_dev(div29, div19);
    			append_dev(div19, span4);
    			append_dev(div19, t32);
    			append_dev(div19, div17);
    			append_dev(div17, textarea4);
    			append_dev(div19, t33);
    			append_dev(div19, div18);
    			append_dev(div29, t35);
    			append_dev(div29, div22);
    			append_dev(div22, span5);
    			append_dev(div22, t37);
    			append_dev(div22, div20);
    			append_dev(div20, textarea5);
    			append_dev(div22, t38);
    			append_dev(div22, div21);
    			append_dev(div29, t40);
    			append_dev(div29, div25);
    			append_dev(div25, span6);
    			append_dev(div25, t42);
    			append_dev(div25, div23);
    			append_dev(div23, textarea6);
    			append_dev(div25, t43);
    			append_dev(div25, div24);
    			append_dev(div29, t45);
    			append_dev(div29, div28);
    			append_dev(div28, span7);
    			append_dev(div28, t47);
    			append_dev(div28, div26);
    			append_dev(div26, textarea7);
    			append_dev(div28, t48);
    			append_dev(div28, div27);
    			append_dev(div33, t50);
    			append_dev(div33, div31);
    			append_dev(div31, div30);
    			append_dev(div30, input8);
    			append_dev(div30, t51);
    			append_dev(div30, span8);
    			append_dev(span8, t52);
    			append_dev(span8, a);
    			append_dev(span8, t54);
    			append_dev(div31, t55);
    			append_dev(div31, button);
    			append_dev(div33, t57);
    			append_dev(div33, div32);
    			append_dev(div32, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div33);
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

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.querySelector("#bewerbungsformular-hook"),
    });

    return app;

})();
//# sourceMappingURL=bewerbungsformular.js.map
