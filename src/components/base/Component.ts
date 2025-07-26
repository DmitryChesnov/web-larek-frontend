export abstract class Component<T> {
  constructor(protected readonly container: HTMLElement) {}

  protected setText(element: HTMLElement, value: unknown) {
    if (element) element.textContent = String(value);
  }

  protected setImage(element: HTMLImageElement, src: string, alt?: string) {
    if (element) {
      element.src = src;
      if (alt) element.alt = alt;
    }
  }

  abstract render(data?: T): HTMLElement;
}