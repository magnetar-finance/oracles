pragma solidity ^0.8.0;

import '../PriceSource.sol';
import './interfaces/ICLFactory.sol';
import './interfaces/ICLPoolConstants.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract MagnetarV3PriceSource is PriceSource {
    ICLFactory public immutable factory;

    constructor(
        ICLFactory _factory,
        address _usdt,
        address _usdc,
        address _weth
    ) PriceSource('Magnetar Finance V3', _usdt, _usdc, _weth) {
        factory = _factory;
    }

    function _getBalance(address token, address _acc) private view returns (uint256 _balance) {
        (, bytes memory data) = token.staticcall(abi.encodeWithSelector(IERC20.balanceOf.selector, _acc));
        _balance = abi.decode(data, (uint256));
    }

    function _getDecimals(address token) private view returns (uint8 _decimals) {
        (, bytes memory data) = token.staticcall(abi.encodeWithSelector(bytes4(keccak256(bytes('decimals()')))));
        _decimals = abi.decode(data, (uint8));
    }

    function _deriveAmountOut(
        address token0,
        address token1,
        uint256 _amountIn
    ) internal view returns (uint256 amountOut) {
        int24[] memory tickSpacings = factory.tickSpacings();
        uint successfulIterations = 1; // Start from 1 for division
        for (uint i = 0; i < tickSpacings.length; i++) {
            address pool = factory.getPool(token0, token1, tickSpacings[i]);
            if (pool == address(0)) continue;
            uint256 balanceA = _getBalance(token0, pool);
            uint256 balanceB = _getBalance(token1, pool);
            if (balanceA == 0 || balanceB == 0) continue;
            // Calculate price of token A in terms of B
            uint8 decimalsA = _getDecimals(token0);
            uint256 priceA = (balanceB * 10 ** decimalsA) / balanceA;
            uint256 aOut = (_amountIn * priceA) / (10 ** decimalsA);
            if (aOut > 0) {
                if (amountOut > 0) successfulIterations += 1;
                amountOut += aOut;
            }
        }

        amountOut /= successfulIterations;
    }

    function _getUnitValueInETH(address token) internal view override returns (uint256 amountOut) {
        uint8 _decimals = ERC20(token).decimals();
        uint256 _amountIn = 1 * 10 ** _decimals;
        amountOut = _deriveAmountOut(token, weth, _amountIn);
    }

    function _getUnitValueInUSDC(address token) internal view override returns (uint256) {
        uint256 _valueInETH = _getUnitValueInETH(token);
        uint256 _ethUSDCAmountOut = _deriveAmountOut(weth, usdc, _valueInETH);

        if (_ethUSDCAmountOut > 0) {
            return _ethUSDCAmountOut;
        } else {
            uint8 _tokenDecimals = ERC20(token).decimals();
            uint256 _amountIn = 1 * 10 ** _tokenDecimals;
            uint256 amountOut = _deriveAmountOut(token, usdc, _amountIn);
            return amountOut;
        }
    }

    function _getUnitValueInUSDT(address token) internal view override returns (uint256) {
        uint256 _valueInETH = _getUnitValueInETH(token);
        uint256 _ethUSDTAmountOut = _deriveAmountOut(weth, usdt, _valueInETH);

        if (_ethUSDTAmountOut > 0) {
            return _ethUSDTAmountOut;
        } else {
            uint8 _tokenDecimals = ERC20(token).decimals();
            uint256 _amountIn = 1 * 10 ** _tokenDecimals;
            uint256 amountOut = _deriveAmountOut(token, usdt, _amountIn);
            return amountOut;
        }
    }
}
