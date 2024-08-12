import { CreateSpace } from "../generated/SpaceFactory/SpaceFactory";
import { Space } from "../generated/schema";
import { Space as SpaceContract } from "../generated/templates";

export function handleCreateSpace(event: CreateSpace): void {
  let space = new Space(event.params.space.toHexString());
  space.owner = "0x0000000000000000000000000000000000000000";
  space.save();
  SpaceContract.create(event.params.space);
}
