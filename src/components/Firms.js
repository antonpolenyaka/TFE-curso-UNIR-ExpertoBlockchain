import React, { Component } from 'react'
import './App.css'
import Web3 from 'web3'
import contractWorksAbi from '../abis/Works.json'
import contractDronAbi from '../abis/Dron.json'
import contractPlotAbi from '../abis/Plot.json'
import { WorksAddress, DronAddress, PlotAddress, FumigationDronTokenAddress, NetworkIdToUse, TokenDecimals } from "./config.js";
import { Icon } from 'semantic-ui-react'
import centralImage from '../imagenes/dron-in-work.png'

class Firms extends Component {

    // Constructor
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            account: "",
            errorMessage: "",
            contractWorks: null,
            contractDron: null,
            pendingWorks: [],
            workToDo: {
                id: 0,
                plotOwner: null,
                timestamp: null,
                plotId: 0,
                plotName: null,
                dronId: 0,
                dronName: null,
                pesticide: undefined,
                rangeWork: ".. [0 - 0] ..",
                tokensToPay: 0,
                plotAllowedMinimumFlightHeight: 0,
                plotAllowedMaximumFlightHeight: 0,
                dronMinimumFlightHeight: 0,
                dronMaximumFlightHeight: 0
            },
            suscriptionNewDronAdded: null,
            suscriptionPlotAlreadyFumigated: null,
            showedEvents: []
        }
    }

    async componentWillMount() {
        // 1. Load Web3
        await this.loadWeb3(this);
        // 2. Load blockchain dataa
        await this.loadBlockchainData();
        // 3. Sucribe to events
        await this.suscribeEvents();
        // 4. First load
        await this.getShowAllPendingWorks();
    }

    async componentWillUnmount() {
        // 1. Unsucribe events
        this.unsuscribeEvents();
    }

    // 1. Carga de Web3
    async loadWeb3(self) {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
                    .catch((error) => {
                        if (error.code === 4001) {
                            // EIP-1193 userRejectedRequest error
                            console.warn('Please connect to Web3 Wallet.');
                        } else {
                            console.error(error);
                        }
                    });
                console.debug("accounts: " + accounts);
                if (accounts && accounts.length > 0) {
                    self.setState({ accounts: accounts, account: accounts[0], hasWeb3Account: true });

                    window.ethereum.on('accountsChanged', function (accounts) {
                        // Time to reload your interface with accounts[0]!
                        console.debug("Account changed. accounts: ", accounts)
                        if (accounts && accounts.length > 0) {
                            self.setState({ accounts: accounts, account: accounts[0], hasWeb3Account: true });
                            self.getShowAllPendingWorks();
                        } else {
                            self.setState({ accounts: null, account: null, hasWeb3Account: false });
                        }
                    });
                }
            } catch (err) {
                console.error("loadWeb3", err);
                window.alert("load web3. " + err)
            }
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert('Not detected any wallet. You will try any wallet with web3 support like Metamask!');
        }
    }

    async suscribeEvents() {
        // Events suscribe
        if (this.state.suscriptionNewDronAdded === null) {
            this.eventCatchNewDronAdded();
        }
        if (this.state.suscriptionPlotAlreadyFumigated === null) {
            this.eventCatchPlotAlreadyFumigated();
        }
    }

    unsuscribeEvents() {
        // Unsubscribes the subscription

        // NewDronAdded
        if (this.state.suscriptionNewDronAdded !== null) {
            this.state.suscriptionNewDronAdded.unsubscribe(function (error, success) {
                if (success) {
                    console.debug('Successfully unsubscribed NewDronAdded!');
                } else {
                    console.error("Error when unsubscribe NewDronAdded", error);
                }
            });
        }

        // PlotAlreadyFumigated
        if (this.state.suscriptionPlotAlreadyFumigated !== null) {
            this.state.suscriptionPlotAlreadyFumigated.unsubscribe(function (error, success) {
                if (success) {
                    console.debug('Successfully unsubscribed PlotAlreadyFumigated!');
                } else {
                    console.error("Error when unsubscribe PlotAlreadyFumigated", error);
                }
            });
        }

        // General cleaning
        window.web3.eth.clearSubscriptions();
    }

    eventCatchNewDronAdded() {
        let options = {
            address: [this.state.account],
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        let suscriptionTemp = this.state.contractDron.events.NewDronAdded(options)
            .on('data', event => {
                // Check if event already showed to user
                if (this.state.showedEvents.includes(event.id) === false) {
                    this.state.showedEvents.push(event.id);
                    console.debug("eventCatchNewDronAdded.data", event);
                    const ownerReceive = event.returnValues.owner;
                    const dronIdReceive = event.returnValues.dronId;
                    alert(`Nueva parcela dada de alta con identificador #${dronIdReceive}! Propietario: ${ownerReceive}.`);
                }
            })
            .on('changed', changed => console.debug("eventCatchNewDronAdded.changed", changed))
            .on('error', err => console.error("eventCatchNewDronAdded.error", err))
            .on('connected', str => console.debug("eventCatchNewDronAdded.connected", str));
        this.setState({ suscriptionNewDronAdded: suscriptionTemp });
    }

    eventCatchPlotAlreadyFumigated() {
        let options = {
            address: [this.state.account],
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        let suscriptionTemp = this.state.contractWorks.events.PlotAlreadyFumigated(options)
            .on('data', event => {
                // Check if event already showed to user
                if (this.state.showedEvents.includes(event.id) === false) {
                    this.state.showedEvents.push(event.id);
                    console.debug("eventCatchPlotAlreadyFumigated.data", event);
                    const plotIdReceive = event.returnValues.plotId_;
                    const dronIdReceive = event.returnValues.dronId_;
                    const tokensPayedReceive = event.returnValues.tokensPayed_;
                    const price = this.tokenRemoveDecimals(tokensPayedReceive);
                    alert(`Trabajo de fumigación realizado. Parcela #${plotIdReceive}! Dron: ${dronIdReceive}. Precio por el trabajo: ${price} FDT`);
                    this.getShowAllPendingWorks();
                }
            })
            .on('changed', changed => console.debug("eventCatchPlotAlreadyFumigated.changed", changed))
            .on('error', err => console.error("eventCatchPlotAlreadyFumigated.error", err))
            .on('connected', str => console.debug("eventCatchPlotAlreadyFumigated.connected", str));
        this.setState({ suscriptionPlotAlreadyFumigated: suscriptionTemp });
    }

    async checkNetworkId(networkId) {
        let isOk;
        if (networkId === NetworkIdToUse) {
            isOk = true;
        } else {
            isOk = false;
        }
        return isOk;
    }

    // 2. Carga de datos de la Blockchain
    async loadBlockchainData() {
        const method = "loadBlockchainData";
        try {
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            this.setState({ account: accounts[0] });
            console.debug('Account:', this.state.account);
            console.debug(method + ": Get network id");
            const networkId = await web3.eth.net.getId(); // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
            this.setState({ currentNetworkId: networkId });
            let isOk = await this.checkNetworkId(networkId);
            console.debug({ DronAddress, WorksAddress, PlotAddress, networkId });
            if (!isOk) {
                console.error(`Network id '${networkId}' is incorrect. The correct network is '${NetworkIdToUse}'`);
            } else {
                // Contract Works
                const contractWorks = new web3.eth.Contract(contractWorksAbi.abi, WorksAddress);
                // Contract Dron
                const contractDron = new web3.eth.Contract(contractDronAbi.abi, DronAddress);
                // Contract Plot
                const contractPlot = new web3.eth.Contract(contractPlotAbi.abi, PlotAddress);

                this.setState({ contractWorks, contractDron, contractPlot });
            }
        } catch (err) {
            console.error({ method, err });
        }
    }

    // Functions

    addDron = async (message, dronName, maxHight, minHight, priceBN, pesticide) => {
        console.debug({ message, dronName, maxHight, minHight, priceBN, pesticide });
        try {
            const account = this.state.account;
            await this.state.contractDron.methods.addDron(dronName, maxHight, minHight, priceBN, pesticide).send({ from: account });
        } catch (err) {
            console.error("addDron", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    getShowAllPendingWorks = async () => {
        const owner = this.state.account;
        const method = "getShowAllPendingWorks";
        const message = `Get and show all pending work for owner of drons ${owner}`;
        console.debug({ method, message, owner });

        // Get ids of pending not finished works
        let ids = await this.state.contractWorks.methods.getNotFinishedWorks(owner).call();
        console.log({ method, ids });

        // Get info of works
        let works = [];
        if (ids.length > 0) {
            for (let index = 0; index < ids.length; index++) {
                const id = ids[index];
                const work = await this.state.contractWorks.methods.getWorkInfo(id).call();
                works.push(work);
            }
            console.log({ works });
        }
        this.setState({ pendingWorks: works });
    }

    unixTimeToDate(unixTime) {
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        const date = new Date(unixTime * 1000);
        let day = date.getDate();
        console.log({day});
        if (day < 10) {
            day = `0${day}`;
            console.log({day});
        }
        let month = date.getMonth();
        console.log({month});
        if (month < 10) {
            month = `0${month}`;
            console.log({month});
        }
        const year = date.getFullYear();
        console.log({year});
        let hours = date.getHours();
        console.log({hours});
        if (hours < 10) {
            hours = `0${hours}`;
            console.log({hours});
        }
        let minutes = date.getMinutes();
        console.log("minutes.1", minutes);
        if (minutes < 10) {
            minutes = `0${minutes}`;
            console.log("minutes.2", minutes);
        }
        let seconds = date.getSeconds();
        console.log("seconds.1", seconds);
        if (seconds < 10) {
            seconds = `0${seconds}`;
            console.log("seconds.2", seconds);
        }

        // Will display time in 31/12/2022 10:30:23 format
        const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        return formattedTime;
    }

    doFumigationWork = async (message) => {
        console.debug({ message });
        try {
            const account = this.state.account;
            const workId = this.state.workToDo.id;
            await this.state.contractWorks.methods.doFumigationWork(workId).send({ from: account });
        } catch (err) {
            console.error("doFumigationWork", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    showWorkToDo = async (message, workId) => {
        console.debug({ message, workId });
        try {
            let work = undefined;
            const works = this.state.pendingWorks;
            for (let index = 0; index < works.length; index++) {
                if (parseInt(works[index].id) === parseInt(workId)) {
                    work = works[index];
                }
            }

            if (work !== undefined) {
                const plot = await this.state.contractPlot.methods.getPlotInfo(work.plotId).call();
                const plotOwner = await this.state.contractPlot.methods.getPlotOwner(work.plotId).call();
                const dron = await this.state.contractDron.methods.getDronInfo(work.dronId).call();

                let plotMin = parseInt(plot.allowedMinimumFlightHeight);
                let plotMax = parseInt(plot.allowedMaximumFlightHeight);
                let dronMin = parseInt(dron.minimumFlightHeight);
                let dronMax = parseInt(dron.maximumFlightHeight);

                let min = dronMin;
                if (min < plotMin) {
                    min = plotMin;
                }
                let max = dronMax;
                if (max > plotMax) {
                    max = plotMax;
                }
                let rangeWork = `[${min} .. ${max}]`;

                this.setState({
                    workToDo: {
                        id: work.id,
                        plotOwner: plotOwner,
                        timestamp: this.unixTimeToDate(work.timestampCreate),
                        plotId: plot.id,
                        plotName: plot.name,
                        dronId: dron.id,
                        dronName: dron.name,
                        pesticide: dron.pesticide,
                        rangeWork: rangeWork,
                        tokensToPay: work.tokensToPay,
                        plotAllowedMinimumFlightHeight: plotMin,
                        plotAllowedMaximumFlightHeight: plotMax,
                        dronMinimumFlightHeight: dronMin,
                        dronMaximumFlightHeight: dronMax
                    }
                });
            } else {
                this.setState({
                    workToDo: {
                        id: 0,
                        plotOwner: null,
                        timestamp: null,
                        plotId: 0,
                        plotName: null,
                        dronId: 0,
                        dronName: null,
                        pesticide: undefined,
                        rangeWork: ".. [0 - 0] ..",
                        tokensToPay: 0,
                        plotAllowedMinimumFlightHeight: 0,
                        plotAllowedMaximumFlightHeight: 0,
                        dronMinimumFlightHeight: 0,
                        dronMaximumFlightHeight: 0
                    }
                });
            }
        } catch (err) {
            console.error("showWorkToDo", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    tokenRemoveDecimals(tokenPrice) {
        const price = parseInt(tokenPrice) / Math.pow(10, TokenDecimals);
        return price;
    }

    convertFloatToTokensNoDecimals = (amount) => {
        const amountFloat = parseFloat(amount);
        const amountFixDecimals = amountFloat.toFixed(TokenDecimals);
        const amountWithoutDecimals = amountFixDecimals * Math.pow(10, TokenDecimals);
        return amountWithoutDecimals;
    }

    pesticideToString(id) {
        let result;
        switch (parseInt(id)) {
            case 0:
                result = "Pesticida A";
                break;
            case 1:
                result = "Pesticida B";
                break;
            case 2:
                result = "Pesticida C";
                break;
            case 3:
                result = "Pesticida D";
                break;
            case 4:
                result = "Pesticida E";
                break;
            default:
                result = "";
                break;
        }
        return result;
    }

    // Render de la DApp
    render() {
        let workSelectors = [];
        const works = this.state.pendingWorks;
        workSelectors.push(<option value="0" key="0">-------------------</option>);
        if (works) {
            for (let i = 0; i < works.length; i++) {
                const price = this.tokenRemoveDecimals(works[i].tokensToPay);
                workSelectors.push(<option value={works[i].id} key={works[i].id}>#{works[i].id}: Parcela #{works[i].plotId} Dron #{works[i].dronId} ({price} FDT)</option>);
            }
        }
        console.log({works});

        const infoWorkAndButton = this.state.pendingWorks.length > 0 && this.state.workToDo.id > 0 && (
            <>
                <label><b>Wallet propietario de parcela:</b> {this.state.workToDo.plotOwner}</label><br />
                <label><b>Fecha del pedido:</b> {this.state.workToDo.timestamp}</label><br />
                <label><b>Parcela:</b> #{this.state.workToDo.plotId} {this.state.workToDo.plotName} ({this.state.workToDo.plotAllowedMinimumFlightHeight} - {this.state.workToDo.plotAllowedMaximumFlightHeight})</label><br />
                <label><b>Dron:</b> #{this.state.workToDo.dronId} {this.state.workToDo.dronName} ({this.state.workToDo.dronMinimumFlightHeight} - {this.state.workToDo.dronMaximumFlightHeight})</label><br />
                <label><b>Pesticida a utilizar:</b> {this.pesticideToString(this.state.workToDo.pesticide)}</label><br />
                <label><b>Rango de altura de trabajo:</b> {this.state.workToDo.rangeWork}</label><br />
                <label><b>Precio a cobrar por trabajo realizado:</b> {this.tokenRemoveDecimals(this.state.workToDo.tokensToPay)} FDT</label><br />

                <input type="submit"
                    className='bbtn btn-block btn-warning btn-sm'
                    value='FUMIGAR PARCELA' />
            </>
        );

        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a
                        className="navbar-brand col-sm-3 col-md-2 mr-0"
                        href="https://antonp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        DApp Fumigación con drones
                    </a>

                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            <small className="text-white"><span id="account">Cuenta activa: {this.state.account}</span></small>
                        </li>
                    </ul>

                </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">

                                <h1>Area de empresa</h1>
                                <p><b>Contrato de los drones:</b> {DronAddress}<br />
                                    <b>Contrato de los trabajos:</b> {WorksAddress}<br />
                                    <b>Contrato del token:</b> {FumigationDronTokenAddress}
                                </p>
                                <h2>Alta de drones y ejecución de trabajos</h2>

                                <a href="https://www.linkedin.com/in/antonpolenyaka/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <p> </p>
                                    <img src={centralImage} width="530" height="353" alt="" />
                                </a>
                                <p></p>

                                <h3><Icon circular inverted color='green' name='plane' /> Registro de un Dron</h3>

                                <form className='txt-h-start' onSubmit={(event) => {
                                    event.preventDefault()
                                    const dronName = this.dronName.value;
                                    const minHight = parseInt(this.minHight.value);
                                    const maxHight = parseInt(this.maxHight.value);
                                    const pesticide = parseInt(this.pesticide.value);
                                    const priceFloat = parseFloat(this.price.value); // Value possible decimals
                                    const priceUINT = this.convertFloatToTokensNoDecimals(priceFloat);
                                    const priceBN = new Web3.utils.toBN(priceUINT);
                                    const message = "Register dron..."
                                    this.addDron(message, dronName, maxHight, minHight, priceBN, pesticide);
                                }
                                }>
                                    <label><b>Wallet propietario del dron:</b> {this.state.account}</label>

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Nombre del dron"
                                        ref={(input) => this.dronName = input} />

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Altura mínima de vuelo"
                                        ref={(input) => this.minHight = input} />

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Altura máxima de vuelo"
                                        ref={(input) => this.maxHight = input} />

                                    <select name="Pesticides"
                                        id="Pesticides"
                                        className='form-control mb-1'
                                        ref={(input) => this.pesticide = input}>
                                        <option value="0">{this.pesticideToString(0)}</option>
                                        <option value="1">{this.pesticideToString(1)}</option>
                                        <option value="2">{this.pesticideToString(2)}</option>
                                        <option value="3">{this.pesticideToString(3)}</option>
                                        <option value="4">{this.pesticideToString(4)}</option>
                                    </select>

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Precio por trabajo en tokens FDT   "
                                        ref={(input) => this.price = input} />

                                    <input type="submit"
                                        className='bbtn btn-block btn-success btn-sm'
                                        value='REGISTRAR DRON' />
                                </form>

                                <h3><Icon circular inverted color='orange' name='tasks' /> Realizar tareas de fumigación</h3>

                                <form className='txt-h-start' onSubmit={(event) => {
                                    event.preventDefault();
                                    const message = "Do fumigation work...";
                                    this.doFumigationWork(message);
                                }
                                }>
                                    <select name="workId" id="workId" className='form-control mb-1' onChange={(event) => {
                                        event.preventDefault();
                                        const message = "Selected work to do...";
                                        const workId = parseInt(event.target.value);
                                        this.showWorkToDo(message, workId);
                                    }
                                    }>
                                        {workSelectors}
                                    </select>

                                    {infoWorkAndButton}
                                </form>
                                <p>&nbsp;</p>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default Firms