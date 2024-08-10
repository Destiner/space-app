const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract Space",
        name: "space",
        type: "address",
      },
    ],
    name: "CreateSpace",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "label",
            type: "string",
          },
          {
            internalType: "string",
            name: "value",
            type: "string",
          },
        ],
        internalType: "struct OrderedLinkList.Link[]",
        name: "links",
        type: "tuple[]",
      },
    ],
    name: "create",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "create",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default abi;
