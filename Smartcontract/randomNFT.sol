// SPDX-License-Identifier: MIT


// https://sabustory.tistory.com/
// NFT 테스트

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract randomNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
    using Strings
    for uint256;

    string public baseURI;
    string public baseExtension = ".json";
    uint256 public cost = 0.001 ether;
    uint256 public maxSupply = 100;
    uint256 public maxMintAmount = 50;
    bool public paused = false;
    mapping(address => bool) public whitelisted;

    uint256 private _mintedCount = 0;
    mapping(uint256 => bool) public _tokenExists;
    uint256 private _tokenIdCounter;

    constructor(
        string memory _initBaseURI
    ) ERC721("RandomTokenID", "SABU") {
        setBaseURI(_initBaseURI);
    }


    // internal
    function _baseURI() 
    internal 
    view 
    virtual 
    override 
    returns(string memory) 
    {
        return baseURI;
    }

    function GenerateRandomTokenId() 
    public 
    returns (uint256) 
    {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(block.timestamp, block.basefee, msg.sender, _tokenIdCounter))) % 100 + 1;
        while (_tokenExists[tokenId]) {
            _tokenIdCounter++;
            tokenId = uint256(keccak256(abi.encodePacked(block.timestamp, block.basefee, msg.sender, _tokenIdCounter))) % 100 + 1; // 100개의 NFT
        }
        return tokenId;
    }


    // 오너 지갑에게 전송하는 함수로, NFT를 판매하는 함수가 아닙니다.
    // 전송할 시, GenerateRandomTokenId() 함수를 불러와 비교하여 TokenId를 랜덤으로 전송합니다.
    function TransForOwner(uint256 _mintAmount) 
    public onlyOwner nonReentrant 
    {
        uint256 supply = totalSupply();
        require(_mintAmount > 0);
        require(_mintAmount <= maxMintAmount);
        require(supply + _mintAmount <= maxSupply); // maxSupply 체크 추가

        for (uint256 i = 1; i <= _mintAmount; i++) {
            if (supply >= maxSupply || _mintedCount >= maxSupply) {
                return; // 이미 maxSupply에 도달하거나 maxSupply에 도달했다면 함수 종료
            }

            uint256 tokenId = GenerateRandomTokenId();

            while (_tokenExists[tokenId]) {
                tokenId = GenerateRandomTokenId();
            }

            _safeMint(msg.sender, tokenId);
            _tokenExists[tokenId] = true;
            _mintedCount++;
            supply++;
        }   
    }

    function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns(string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0 ?
            string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension)) :
            "";
    }

    function walletOfOwner(address _owner)
    public
    view
    returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    //only owner
    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }
}