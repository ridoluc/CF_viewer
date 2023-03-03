class Scrollbar {
	constructor(scrollbar, wrapper) {
		this.bar = scrollbar;
		this.wrapper = wrapper;
		this.scrollWidth = this.wrapper.scrollWidth;
		this.outerWidth = this.wrapper.offsetWidth

		this.cursor = document.getElementById("scroll-cursor");

		this.setCursorWidth();

		this.cursor.style.left = "0px";
		this.cursor.style.cursor = "grabing";
		this.addMouseDownHandler();
	}

	addMouseDownHandler() {
		const cursor = this.cursor;
		const slider = cursor.parentElement;

		const scrollFunc = this.scrolltoPosition;
		const scrolling_elm = this.wrapper;

		cursor.onmousedown = function (e) {
			let shift = e.clientX - cursor.getBoundingClientRect().left;

			cursor.style.userSelect = "none";

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);

			function onMouseMove(e) {

				let newLeft =
					e.clientX -
					shift -
					slider.getBoundingClientRect().left;

				if (newLeft < 0) {
					newLeft = 0;
				}
				let rightEdge = slider.offsetWidth - cursor.offsetWidth;
				if (newLeft > rightEdge) {
					newLeft = rightEdge;
				}

				cursor.style.left = newLeft + "px";

				const new_scroll_position = newLeft/rightEdge*(scrolling_elm.scrollWidth-scrolling_elm.offsetWidth);
				scrollFunc(scrolling_elm,new_scroll_position);
				
			}

			function onMouseUp() {
				document.removeEventListener("mouseup", onMouseUp);
				document.removeEventListener("mousemove", onMouseMove);
				cursor.style.cursor = "grab";
				cursor.style.removeProperty("user-select");
			}
		};
	}

	setCursorWidth(){		
		const bar_width = this.bar.offsetWidth;
		const w_in = this.scrollWidth
		const w_out = this.outerWidth
		
		if(!w_in) return bar_width;

		this.cursor.style.width = bar_width * w_out / w_in + "px";
	}

	scrolltoPosition(scrolling_elm, scrolltoPosition){
		const min_pos = 0;
		const max_pos = Math.abs(scrolling_elm.scrollWidth - scrolling_elm.offsetWidth);

		let new_pos = Math.max(min_pos, Math.min(max_pos, scrolltoPosition))

		scrolling_elm.scrollLeft = new_pos;
	}


}
