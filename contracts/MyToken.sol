// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FeeToken is ERC20, Ownable {
    uint256 private _feePercent = 10; // 0.1% (10 basis points) mặc định
    uint256 private _totalFeesCollected;
    uint256 public constant MAX_FEE = 100; // Tối đa 1% (100 basis points)
    
    event FeeCharged(address indexed from, address indexed to, uint256 amount, uint256 fee);
    event FeeChanged(uint256 oldFee, uint256 newFee);

    constructor(uint256 initialSupply) ERC20("FeeToken", "FEE") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    // Ghi đè hàm transfer để thêm phí
    function transfer(address to, uint256 amount) public override returns (bool) {
        return _transferWithFee(_msgSender(), to, amount);
    }

    // Ghi đè hàm transferFrom để thêm phí
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _spendAllowance(from, _msgSender(), amount);
        return _transferWithFee(from, to, amount);
    }

    // Hàm nội bộ xử lý phí
    function _transferWithFee(address from, address to, uint256 amount) internal returns (bool) {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        uint256 fee = amount * _feePercent / 10000;
        uint256 amountAfterFee = amount - fee;
        
        // Chuyển phí đến chủ sở hữu
        _transfer(from, owner(), fee);
        _totalFeesCollected += fee;
        
        // Chuyển số còn lại đến người nhận
        _transfer(from, to, amountAfterFee);
        
        emit FeeCharged(from, to, amount, fee);
        return true;
    }

    // Thay đổi tỷ lệ phí (chỉ chủ sở hữu)
    function setFeePercent(uint256 newFeePercent) public onlyOwner {
        require(newFeePercent <= MAX_FEE, "FeeToken: fee too high");
        uint256 oldFee = _feePercent;
        _feePercent = newFeePercent;
        emit FeeChanged(oldFee, newFeePercent);
    }

    // Xem tỷ lệ phí hiện tại
    function feePercent() public view returns (uint256) {
        return _feePercent;
    }

    // Kiểm tra tổng phí đã thu
    function totalFeesCollected() public view returns (uint256) {
        return _totalFeesCollected;
    }

    // Rút phí (chỉ chủ sở hữu)
    function withdrawFees() public onlyOwner {
        uint256 feeBalance = balanceOf(owner());
        _transfer(owner(), _msgSender(), feeBalance);
        _totalFeesCollected = 0;
    }
}
