// Several UX helper components inject/remove nodes inside React-managed
// containers (suggestion panels, hero radar list, product modal, price labels).
// When React later reconciles those containers it can try to remove a node that
// is no longer its child, throwing NotFoundError and blanking the whole app.
//
// We make removeChild/insertBefore tolerant instead of fatal.

const GLOBAL_KEY = "__precocerto_tolerant_dom__";

type GuardedWindow = Window & typeof globalThis & { [GLOBAL_KEY]?: boolean };

const guardedWindow = window as GuardedWindow;

if (!guardedWindow[GLOBAL_KEY]) {
  guardedWindow[GLOBAL_KEY] = true;

  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) child.parentNode.removeChild(child);
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  Node.prototype.insertBefore = function <T extends Node>(node: T, reference: Node | null): T {
    if (reference && reference.parentNode !== this) {
      this.appendChild(node);
      return node;
    }
    return originalInsertBefore.call(this, node, reference) as T;
  };
}
