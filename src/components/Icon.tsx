import { useMemo } from "react";

interface Props {
  hrid: string;
}

const foragingActionExceptions = [
  "asteroid_belt",
  "olympus_mons",
  "silly_cow_valley",
  "burble_beach",
  "misty_forest",
  "shimmering_lake",
  "farmland",
];

export default function Icon({ hrid }: Props) {
  const imgUrl = useMemo(() => {
    const split = hrid.split("/");
    const name = split[split.length - 1];
    const type = split[1];
    if (type === "actions") {
      if (
        hrid.includes("/foraging/") &&
        !foragingActionExceptions.includes(name)
      ) {
        return `/items_sprite.951ef1ec.svg#${name}`;
      }
      return `/actions_sprite.cd16f1a6.svg#${name}`;
    } else if (type === "items") {
      return `/items_sprite.951ef1ec.svg#${name}`;
    } else {
      return `/combat_monsters_sprite.0f9c0366.svg#${name}`;
    }
  }, [hrid]);
  return (
    <svg width="30px" height="30px">
      <use href={imgUrl} />
    </svg>
  );
}
