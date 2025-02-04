import { Draggable } from "gsap/Draggable";
import { gsap } from "gsap";

export const dragAndDropDirective = {
  mounted(el, binding) {
    const params = binding.value || {};

    const draggable = Draggable.create(el, {
      type: "x,y",
      edgeResistance: 0.65,
      dragClickables: true,
      onDragEnd: function () {
        // Reset position after drag
        gsap.to(el, { x: 0, y: 0, duration: 0.3 });

        // Find the index of the dragged item
        const parent = el.parentElement;
        const children = Array.from(parent.children);
        const oldIndex = children.indexOf(el);

        // Call user-provided onDragEnd with event details
        if (params.onDragEnd) {
          params.onDragEnd({
            oldIndex,
            newIndex: children.indexOf(el),
            item: el,
          });
        }
      },
    });

    el.draggable = draggable[0];
  },
  unmounted(el) {
    if (el.draggable) {
      el.draggable.kill();
    }
  },
};
