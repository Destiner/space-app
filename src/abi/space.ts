const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "LinkedList_AlreadyInitialized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "LinkedList_EntryAlreadyInList",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "LinkedList_EntryNotInList",
    type: "error",
  },
  {
    inputs: [],
    name: "LinkedList_InvalidPage",
    type: "error",
  },
  {
    inputs: [],
    name: "LinkedList_NullishEntry",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "prevId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "label",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "value",
        type: "string",
      },
    ],
    name: "AddLink",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "NewBio",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "RemoveLink",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prevId",
        type: "uint256",
      },
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
    name: "addLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "bio",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "startId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "getLinks",
    outputs: [
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
        name: "pageLinks",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prevId",
        type: "uint256",
      },
    ],
    name: "removeLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newBio",
        type: "string",
      },
    ],
    name: "setBio",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default abi;
