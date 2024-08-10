/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n  query SpaceAttestation($recipient: String, $context: String) {\n    personalAttestation: attestations(\n      where: {\n        schemaId: {\n          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"\n        }\n        recipient: { equals: $recipient }\n        attester: { equals: $context }\n      }\n    ) {\n      id\n    }\n    attestations(\n      where: {\n        schemaId: {\n          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"\n        }\n        recipient: { equals: $recipient }\n      }\n      take: 10\n    ) {\n      attester\n    }\n  }\n':
    types.SpaceAttestationDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query SpaceAttestation($recipient: String, $context: String) {\n    personalAttestation: attestations(\n      where: {\n        schemaId: {\n          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"\n        }\n        recipient: { equals: $recipient }\n        attester: { equals: $context }\n      }\n    ) {\n      id\n    }\n    attestations(\n      where: {\n        schemaId: {\n          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"\n        }\n        recipient: { equals: $recipient }\n      }\n      take: 10\n    ) {\n      attester\n    }\n  }\n'
): (typeof documents)['\n  query SpaceAttestation($recipient: String, $context: String) {\n    personalAttestation: attestations(\n      where: {\n        schemaId: {\n          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"\n        }\n        recipient: { equals: $recipient }\n        attester: { equals: $context }\n      }\n    ) {\n      id\n    }\n    attestations(\n      where: {\n        schemaId: {\n          equals: "0x5e331c5631c07b6df8b7e28a30cf3ea91d33af545e84e3b0aaf4c12dc3fea507"\n        }\n        recipient: { equals: $recipient }\n      }\n      take: 10\n    ) {\n      attester\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
