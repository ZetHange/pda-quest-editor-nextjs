export function commandLocalizer(param: string): string {
  switch (param) {
    case "add":
      return "Добавить";
    case "remove":
      return "Удалить";
    case "xp":
      return "Добавить/удалить опыт";
    case "money":
      return "Добавить/удалить деньги";
    case "+":
      return "Увеличить отношения";
    case "-":
      return "Уменьшить отношения";
    case "reset":
      return "Сбросить";
    case "syncNow":
      return "Синхронизация с сервером";
    default:
      return param;
  }
}

export function typeCommand(param: string): "item" | "empty" | "null" {
  switch (param) {
    case "add":
      return "item";
    case "remove":
      return "item";
    case "xp":
      return "empty";
    case "money":
      return "empty";
    case "+":
      return "empty";
    case "-":
      return "empty";
    case "reset":
      return "empty";
    case "syncNow":
      return "null";
    default:
      return "empty";
  }
}
