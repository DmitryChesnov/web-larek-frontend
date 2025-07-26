type EventHandler<T = unknown> = (data?: T) => void;
type EventName = string | RegExp;

/**
 * Брокер событий для управления коммуникацией между компонентами
 */
export class EventEmitter {
  private _events: Map<EventName, Set<EventHandler>>;

  constructor() {
    this._events = new Map();
  }

  /**
   * Подписка на событие
   * @param event Имя события или регулярное выражение
   * @param callback Функция-обработчик
   */
  on<T = unknown>(event: EventName, callback: EventHandler<T>): void {
    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    this._events.get(event)?.add(callback);
  }

  /**
   * Отписка от события
   * @param event Имя события или регулярное выражение
   * @param callback Функция-обработчик
   */
  off(event: EventName, callback: EventHandler): void {
    if (this._events.has(event)) {
      const handlers = this._events.get(event);
      handlers?.delete(callback);
      if (handlers?.size === 0) {
        this._events.delete(event);
      }
    }
  }

  /**
   * Генерация события
   * @param event Имя события
   * @param data Данные для передачи обработчикам
   */
  emit<T = unknown>(event: string, data?: T): void {
    this._events.forEach((handlers, name) => {
      if (
        name === '*' || 
        (name instanceof RegExp && name.test(event)) || 
        name === event
      ) {
        handlers.forEach(handler => handler(data));
      }
    });
  }

  /**
   * Подписка на все события
   * @param callback Функция-обработчик
   */
  onAll(callback: (event: string, data?: unknown) => void): void {
    this.on('*', callback);
  }

  /**
   * Создание триггера для привязки к DOM-событиям
   * @param event Имя события
   * @param context Контекст для передачи
   */
  trigger<T = unknown>(
    event: string,
    context: Partial<T> = {}
  ): (data?: T) => void {
    return (eventData?: T) => {
      this.emit(event, {
        ...(eventData || {}),
        ...context
      });
    };
  }

  /**
   * Очистка всех подписок
   */
  destroy(): void {
    this._events.clear();
  }
}