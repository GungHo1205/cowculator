import { ItemDetail } from "../models/Client";
import { MarketValue } from "../models/Market";

export function actionToChestMap(action: string) {
  if (action === "/actions/combat/chimerical_den") {
    return "/items/chimerical_chest";
  } else if (action === "/actions/combat/sinister_circus") {
    return "/items/sinister_chest";
  } else if (action === "/actions/combat/enchanted_fortress") {
    return "/items/enchanted_chest";
  }
}
export function isDungeonToken(item: MarketValue & ItemDetail): boolean {
  if (
    item.hrid === "/items/enchanted_token" ||
    item.hrid === "/items/sinister_token" ||
    item.hrid === "/items/chimerical_token"
  )
    return true;
  else return false;
}
export function actionToTokenMap(action: string) {
  if (action === "/actions/combat/chimerical_den") {
    return "/items/chimerical_token";
  } else if (action === "/actions/combat/sinister_circus") {
    return "/items/sinister_token";
  } else if (action === "/actions/combat/enchanted_fortress") {
    return "/items/enchanted_token";
  }
  return "";
}
