let _TOAST = {
	show: false, 
	component: null
};
export default {
	install(Vue) {
		Vue.prototype.$toast = function(text, opts) {
			let defaultOpts = {
				position: 'center',
				duration: 3000, 
				wordWrap: false,
			};
			opts = Object.assign(defaultOpts, opts);
			let wordWrap = opts.wordWrap ? 'xy-word-wrap' : '';
			let style = opts.width ? `style="width: ${opts.width}"` : '';
			if (_TOAST.show) return;
			if (!_TOAST.component) {
				let ToastComponent = Vue.extend({
					data: function() {
						return {
							show: _TOAST.show,
							text: text,
							position: `zy-toast-${opts.position}`
						}
					},
					template: `<div v-show="show" :class="position" class="xy-toast ${wordWrap}" ${style}>{{text}}</div>`
				});
				_TOAST.component = new ToastComponent();
				let element = _TOAST.component.$mount().$el;
				document.body.appendChild(element);
			}
			_TOAST.component.position = `xy-toast-${opts.position}`;
			_TOAST.component.text = text;
			_TOAST.component.show = _TOAST.show = true;
			setTimeout(function() {
				_TOAST.component.show = _TOAST.show = false;
			}, opts.duration)
		};
	}
}