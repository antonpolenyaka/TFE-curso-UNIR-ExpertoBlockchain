## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| ./src/contracts/IDron.sol | 2e68d028c54cda0e76a9b93d8b0b30d7a0648f68 |
| ./src/contracts/IFumigationDronToken.sol | 1a42e5fd430982f7d7f84fb4c1d7a9538f2ec744 |
| ./src/contracts/IPesticides.sol | 2241bd9bfef3a61c53c8f9b2d07084c61bb1f91b |
| ./src/contracts/IPlot.sol | 340b852cae0c9842ac0421fd5f2ede6dd196058d |
| ./src/contracts/IWorks.sol | 573ea7e7a675ff90e95758d3ec01f7d6da2ae6ff |
| ./src/contracts/Dron.sol | 8722089a6e3773bb47d5c0d2b79b3d7f23679a6d |
| ./src/contracts/FumigationDronToken.sol | 51f75361a81831d33d831aac00f5ea3e035b3583 |
| ./src/contracts/Plot.sol | d83d51bc01ef4f5dd7078e1be675a5565a38f5eb |
| ./src/contracts/Works.sol | 2900a4f83d96b715aa83eb4f7db1d288dc5cc9fc |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **IDron** | Interface | IPesticides |||
| └ | addDron | External ❗️ | 🛑  |NO❗️ |
| └ | getDronOwner | External ❗️ |   |NO❗️ |
| └ | checkDronExist | External ❗️ |   |NO❗️ |
| └ | getDronWorkPrice | External ❗️ |   |NO❗️ |
| └ | getDronInfo | External ❗️ |   |NO❗️ |
||||||
| **IFumigationDronToken** | Interface |  |||
| └ | tokenPrice | External ❗️ |   |NO❗️ |
| └ | buy | External ❗️ |  💵 |NO❗️ |
| └ | sell | External ❗️ |  💵 |NO❗️ |
| └ | transferFromTo | External ❗️ | 🛑  |NO❗️ |
| └ | myBalance | External ❗️ |   |NO❗️ |
||||||
| **IPesticides** | Interface |  |||
||||||
| **IPlot** | Interface | IPesticides |||
| └ | addPlot | External ❗️ | 🛑  |NO❗️ |
| └ | getPlotOwner | External ❗️ |   |NO❗️ |
| └ | getPlotInfo | External ❗️ |   |NO❗️ |
||||||
| **IWorks** | Interface |  |||
| └ | addWork | External ❗️ | 🛑  |NO❗️ |
| └ | getNotFinishedWorks | External ❗️ | 🛑  |NO❗️ |
| └ | doFumigationWork | External ❗️ | 🛑  |NO❗️ |
| └ | balanceTokens | External ❗️ |   |NO❗️ |
| └ | getWorkInfo | External ❗️ |   |NO❗️ |
||||||
| **Dron** | Implementation | IDron, ERC721Enumerable |||
| └ | <Constructor> | Public ❗️ | 🛑  | ERC721 |
| └ | addDron | External ❗️ | 🛑  |NO❗️ |
| └ | getDronOwner | External ❗️ |   |NO❗️ |
| └ | checkDronExist | External ❗️ |   |NO❗️ |
| └ | getDronWorkPrice | External ❗️ |   |NO❗️ |
| └ | getDronInfo | External ❗️ |   |NO❗️ |
||||||
| **FumigationDronToken** | Implementation | ERC20, Ownable, IFumigationDronToken |||
| └ | <Constructor> | Public ❗️ | 🛑  | ERC20 |
| └ | decimals | Public ❗️ |   |NO❗️ |
| └ | tokenPrice | Public ❗️ |   |NO❗️ |
| └ | buy | External ❗️ |  💵 |NO❗️ |
| └ | sell | External ❗️ |  💵 |NO❗️ |
| └ | transferFromTo | External ❗️ | 🛑  |NO❗️ |
| └ | myBalance | External ❗️ |   |NO❗️ |
| └ | contractBalanceETH | External ❗️ |   |NO❗️ |
||||||
| **Plot** | Implementation | ERC721Enumerable, IPlot |||
| └ | <Constructor> | Public ❗️ | 🛑  | ERC721 |
| └ | addPlot | External ❗️ | 🛑  |NO❗️ |
| └ | getPlotOwner | External ❗️ |   |NO❗️ |
| └ | getPlotInfo | External ❗️ |   |NO❗️ |
||||||
| **Works** | Implementation | IWorks |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | addWork | External ❗️ | 🛑  | onlyPlotOwner |
| └ | getNotFinishedWorks | External ❗️ |   |NO❗️ |
| └ | _getWorkIndexFromArray | Internal 🔒 |   | |
| └ | _removeWorkFromNotFinished | Internal 🔒 | 🛑  | |
| └ | doFumigationWork | External ❗️ | 🛑  | onlyDronOwner |
| └ | balanceTokens | External ❗️ |   |NO❗️ |
| └ | getWorkInfo | External ❗️ |   |NO❗️ |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
