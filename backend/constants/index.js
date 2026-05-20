const SESSION_STATES = {
  MAIN_MENU: "MAIN_MENU",
  SELECTING_ITEMS: "SELECTING_ITEMS",
};

const MAIN_MENU_TEXT =
  "Select 1 to Place an order\nSelect 99 to checkout order\nSelect 98 to see order history\nSelect 97 to see current order\nSelect 0 to cancel order";

const ITEM_MENU_FOOTER =
  "\n\nReply with another **Item ID** to add more, **-Item ID** to remove, **97** to view cart, **0** to cancel order, or **2** to return to Main Menu.";

module.exports = { SESSION_STATES, MAIN_MENU_TEXT, ITEM_MENU_FOOTER };
