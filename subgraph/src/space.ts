import { store } from "@graphprotocol/graph-ts";

import { Link, Space } from "../generated/schema";
import {
  Space as SpaceContract,
  AddLink,
  NewOwner,
  RemoveLink,
  NewName,
  NewBio,
} from "../generated/templates/Space/Space";

export function handleNewName(event: NewName): void {
  let space = Space.load(event.address.toHexString());
  if (space == null) {
    space = new Space(event.address.toHexString());
  }
  let contract = SpaceContract.bind(event.address);
  space.name = contract.name();
  space.save();
}

export function handleNewBio(event: NewBio): void {
  let space = Space.load(event.address.toHexString());
  if (space == null) {
    space = new Space(event.address.toHexString());
  }
  let contract = SpaceContract.bind(event.address);
  space.bio = contract.bio();
  space.save();
}

export function handleAddLink(event: AddLink): void {
  let space = Space.load(event.address.toHexString());
  if (space == null) {
    space = new Space(event.address.toHexString());
  }
  let link = new Link(
    event.address.toHexString().concat("-").concat(event.params.id.toString())
  );
  link.space = event.address.toHexString();
  link.value = event.params.value.toString();
  link.label = event.params.label.toString();
  link.save();
}

export function handleNewOwner(event: NewOwner): void {
  let space = Space.load(event.address.toHexString());
  if (space == null) {
    space = new Space(event.address.toHexString());
  }
  space.owner = event.params.owner.toString();
  space.save();
}

export function handleRemoveLink(event: RemoveLink): void {
  let link = new Link(
    event.address.toHexString().concat("-").concat(event.params.id.toString())
  );
  if (link != null) {
    store.remove("Link", link.id);
  }
}
