// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// Inspired by SentinelList by @rhinestone
library OrderedLinkList {
    uint256 constant START = 0;
    uint256 constant END = 1;

    struct Link {
        string label;
        string value;
    }

    struct SentinelList {
        mapping(uint256 id => uint256 nextId) ids;
        mapping(uint256 id => Link link) links;
    }

    function getLinkId(Link memory _link) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            _link.label,
            _link.value
        )));
    }

    error LinkedList_AlreadyInitialized();
    error LinkedList_InvalidPage();
    error LinkedList_NullishEntry();
    error LinkedList_EntryAlreadyInList(uint256 id);
    error LinkedList_EntryNotInList(uint256 id);

    function isEmpty(SentinelList storage self) internal view returns (bool) {
        return self.ids[START] != END;
    }

    function contains(SentinelList storage self, uint256 id) internal view returns (bool) {
        return self.ids[id] != 0;
    }

    function init(SentinelList storage self) internal {
        if (!isEmpty(self)) {
            revert LinkedList_AlreadyInitialized();
        }
        self.ids[START] = END;
    }

    /**
     * Insert a new entry to the linked list
     *
     * Before:
     * Start -> A -> B -> End
     * After:
     * Start -> A -> X -> B -> End
     *
     * @param self The linked list
     * @param prevId The entry ID that precedes the inserted entry
     * @param label The new entry label
     * @param value The new entry value
     */
    function insert(SentinelList storage self, uint256 prevId, string memory label, string memory value) internal returns(uint256 id) {
        Link memory link = Link(label, value);
        id = getLinkId(link);
        if (contains(self, id)) {
            revert LinkedList_EntryAlreadyInList(id);
        }
        if (id == 0) {
            revert LinkedList_NullishEntry();
        }
        uint256 nextId = self.ids[prevId];
        self.ids[prevId] = id;
        self.ids[id] = nextId;
        self.links[id] = link;
    }

    /**
     * Remove the entry from the linked list
     *
     * Before:
     * Start -> A -> X -> B -> End
     * After:
     * Start -> A -> B -> End
     *
     * @param self The linked list
     * @param prevId The preceeding entry ID
     */
    function remove(SentinelList storage self, uint256 prevId) internal returns(uint256 id) {
        id = self.ids[prevId];
        if (!contains(self, id)) {
            revert LinkedList_EntryNotInList(id);
        }
        if (id == 0) {
            revert LinkedList_NullishEntry();
        }
        uint256 nextId = self.ids[id];
        self.ids[prevId] = nextId;
        delete self.ids[id];
        delete self.links[id];
    }

    function reorder(SentinelList storage self, uint256 oldPrevId, uint256 newPrevId) internal returns(uint256 id) {
        id = self.ids[oldPrevId];
        if (!contains(self, id)) {
            revert LinkedList_EntryNotInList(id);
        }
        if (id == 0) {
            revert LinkedList_NullishEntry();
        }
        uint256 oldNextId = self.ids[id];
        uint256 newNextId = self.ids[newPrevId];
        self.ids[oldPrevId] = oldNextId;
        self.ids[newPrevId] = id;
        self.ids[id] = newNextId;
    }

    function getEntriesPaginated(
        SentinelList storage self,
        uint256 startId,
        uint256 pageSize
    )
        internal
        view
        returns (Link[] memory array, uint256 nextId)
    {
        if (startId != START && !contains(self, startId)) revert LinkedList_EntryNotInList(startId);
        if (pageSize == 0) revert LinkedList_InvalidPage();
        // Init array with max page size
        array = new Link[](pageSize);

        // Populate return array
        uint256 entryCount = 0;
        nextId = self.ids[startId];
        while (nextId != END && entryCount < pageSize) {
            array[entryCount] = self.links[nextId];
            nextId = self.ids[nextId];
            entryCount++;
        }

        /**
         * Because of the argument validation, we can assume that the loop will always iterate over
         * the valid entry list values
         *       and the `next` variable will either be an enabled entry or a sentinel address
         * (signalling the end).
         *
         *       If we haven't reached the end inside the loop, we need to set the next pointer to
         * the last element of the entry array
         *       because the `next` variable (which is a entry by itself) acting as a pointer to the
         * start of the next page is neither
         *       incSENTINELrent page, nor will it be included in the next one if you pass it as a
         * start.
         */
        if (nextId != END && entryCount > 0) {
            nextId = getLinkId(array[entryCount - 1]);
        }
        // Set correct size of returned array
        // solhint-disable-next-line no-inline-assembly
        /// @solidity memory-safe-assembly
        assembly {
            mstore(array, entryCount)
        }
    }
}

// Simplified version of OZ Ownable
contract Ownable {
    address private _owner;

    event NewOwner(address indexed owner);

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        _owner = initialOwner;

        emit NewOwner(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != msg.sender) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
    }

    function transferOwnership(address newOwner) public onlyOwner {
        _owner = newOwner;

        emit NewOwner(newOwner);
    }
}

contract Space is Ownable {
    using OrderedLinkList for OrderedLinkList.SentinelList;

    event AddLink(uint256 indexed id, uint256 prevId, string label, string value);
    event RemoveLink(uint256 indexed id);
    event ReorderLink(uint256 indexed id, uint256 oldPrevId, uint256 newPrevId);
    event NewBio();
    event NewName();

    string public name;
    string public bio;
    OrderedLinkList.SentinelList links;

    constructor() Ownable(msg.sender) {
        links.init();
    }

    function setName(string calldata newName) external onlyOwner {
        name = newName;

        emit NewName();
    }

    function setBio(string calldata newBio) external onlyOwner {
        bio = newBio;

        emit NewBio();
    }

    function addLink(uint256 prevId, string calldata label, string calldata value) external onlyOwner {
        uint256 id = links.insert(prevId, label, value);

        emit AddLink(id, prevId, label, value);
    }

    function removeLink(uint256 prevId) external onlyOwner {
        uint256 id = links.remove(prevId);

        emit RemoveLink(id);
    }

    function reorderLink(uint256 oldPrevId, uint256 newPrevId) external onlyOwner {
        uint256 id = links.reorder(oldPrevId, newPrevId);
        emit ReorderLink(id, oldPrevId, newPrevId);
    }

    function getLinks(uint256 startId, uint256 limit) external view returns(OrderedLinkList.Link[] memory pageLinks) {
        (pageLinks,) = links.getEntriesPaginated(startId, limit);
    }
}

contract SpaceFactory {
    event CreateSpace(Space space);

    function create() external {
        Space space = new Space();
        space.transferOwnership(msg.sender);

        emit CreateSpace(space);
    }

    function create(OrderedLinkList.Link[] calldata links) external {
        Space space = new Space();
        emit CreateSpace(space);

        for (uint256 i = links.length; i > 0; i--) {
            space.addLink(0, links[i - 1].label, links[i - 1].value);
        }
        space.transferOwnership(msg.sender);
    }
}