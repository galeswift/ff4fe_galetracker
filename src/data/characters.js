// Ids match fftracker's character indices. `flag` is the name used in C flags (start:, no:, only:).
// Cecil and Rydia change portrait automatically: Cecil after Mt Ordeals, Rydia after Dwarf Castle.
export const CHARACTERS = [
    { id: 0, name: "Cecil", flag: "CECIL", image: "images/cecil_dknight.png", altImage: "images/cecil_paladin.png" },
    { id: 1, name: "Kain", flag: "KAIN", image: "images/kain.png" },
    { id: 2, name: "Rydia", flag: "RYDIA", image: "images/rydia_child.png", altImage: "images/rydia_adult.png" },
    { id: 3, name: "Tellah", flag: "TELLAH", image: "images/tellah.png" },
    { id: 4, name: "Edward", flag: "EDWARD", image: "images/edward.png" },
    { id: 5, name: "Rosa", flag: "ROSA", image: "images/rosa.png" },
    { id: 6, name: "Yang", flag: "YANG", image: "images/yang.png" },
    { id: 7, name: "Palom", flag: "PALOM", image: "images/palom.png" },
    { id: 8, name: "Porom", flag: "POROM", image: "images/porom.png" },
    { id: 9, name: "Cid", flag: "CID", image: "images/cid.png" },
    { id: 10, name: "Edge", flag: "EDGE", image: "images/edge.png" },
    { id: 11, name: "FuSoYa", flag: "FUSOYA", image: "images/fusoya.png" },
];

export const CECIL = 0;
export const RYDIA = 2;
export const EMPTY_SLOT_IMAGE = "images/character_blank.png";
