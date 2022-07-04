import React, { Component } from 'react'
import './App.css'
import Web3 from 'web3'
import contractPlotAbi from '../abis/Plot.json'
import contractWorksAbi from '../abis/Works.json'
import contractDronAbi from '../abis/Dron.json'
import { PlotAddress, WorksAddress, DronAddress, FumigationDronTokenAddress, NetworkIdToUse, TokenDecimals } from "./config.js";
import { Icon } from 'semantic-ui-react'
import centralImage from '../imagenes/plots-for-fumigation.png'

class Clients extends Component {

    // Constructor
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            account: "",
            errorMessage: "",
            contractPlot: null,
            contractWorks: null,
            contractDron: null,
            ownerPlots: [],
            allDrons: [],
            dronOwners: [],
            filteredDrons: [],
            plotToWork: {
                id: 0,
                owner: "",
                allowedMaximumFlightHeight: 0,
                allowedMinimumFlightHeight: 0,
                allowedPesticide: ""
            },
            dronToWork: {
                id: 0,
                owner: "",
                minimumFlightHeight: 0,
                maximumFlightHeight: 0,
                price: 0
            },
            suscriptionNewPlotAdded: null,
            suscriptionNewWorkAdded: null,
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
        await this.getShowAllOwnerPlots();
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
                            self.getShowAllOwnerPlots();
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
        if (this.state.suscriptionNewPlotAdded === null) {
            this.eventCatchNewPlotAdded();
        }
        if (this.state.suscriptionNewWorkAdded === null) {
            this.eventCatchNewWorkAdded();
        }
    }

    unsuscribeEvents() {
        // Unsubscribes the subscription

        // NewPlotAdded
        if (this.state.suscriptionNewPlotAdded !== null) {
            this.state.suscriptionNewPlotAdded.unsubscribe(function (error, success) {
                if (success) {
                    console.debug('Successfully unsubscribed NewPlotAdded!');
                } else {
                    console.error("Error when unsubscribe NewPlotAdded", error);
                }
            });
        }

        // NewWorkAdded
        if (this.state.suscriptionNewWorkAdded !== null) {
            this.state.suscriptionNewWorkAdded.unsubscribe(function (error, success) {
                if (success) {
                    console.debug('Successfully unsubscribed NewWorkAdded!');
                } else {
                    console.error("Error when unsubscribe NewWorkAdded", error);
                }
            });
        }

        // General cleaning
        window.web3.eth.clearSubscriptions();
    }

    eventCatchNewPlotAdded() {
        let options = {
            address: [this.state.account],
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        let suscriptionTemp = this.state.contractPlot.events.NewPlotAdded(options)
            .on('data', event => {
                // Check if event already showed to user
                if (this.state.showedEvents.includes(event.id) === false) {
                    this.state.showedEvents.push(event.id);
                    console.debug("eventCatchNewPlotAdded.data", event);
                    const ownerReceive = event.returnValues.owner;
                    const plotIdReceive = event.returnValues.plotId;
                    this.getShowAllOwnerPlots();
                    alert(`Nueva parcela dada de alta con identificador #${plotIdReceive}! Propietario: ${ownerReceive}.`);
                }
            })
            .on('changed', changed => console.debug("eventCatchNewPlotAdded.changed", changed))
            .on('error', err => console.error("eventCatchNewPlotAdded.error", err))
            .on('connected', str => console.debug("eventCatchNewPlotAdded.connected", str));
        this.setState({ suscriptionNewPlotAdded: suscriptionTemp });
    }

    eventCatchNewWorkAdded() {
        let options = {
            address: [this.state.account],
            filter: {
                value: [],
            },
            fromBlock: 'latest'
        };
        const self = this;
        let suscriptionTemp = this.state.contractWorks.events.NewWorkAdded(options)
            .on('data', event => {
                // Check if event already showed to user
                if (this.state.showedEvents.includes(event.id) === false) {
                    this.state.showedEvents.push(event.id);
                    console.debug("eventCatchNewWorkAdded.data", event);
                    const plotIdReceive = event.returnValues.plotId_;
                    const dronIdReceive = event.returnValues.dronId_;
                    const tokensToPayReceive = event.returnValues.tokensToPay_;
                    const price = self.tokenRemoveDecimals(tokensToPayReceive);
                    alert(`Nuevo trabajo creado. Parcela #${plotIdReceive}. Dron #${dronIdReceive}. Coste del trabajo: ${price} FDT`);
                }
            })
            .on('changed', changed => console.debug("eventCatchNewWorkAdded.changed", changed))
            .on('error', err => console.error("eventCatchNewWorkAdded.error", err))
            .on('connected', str => console.debug("eventCatchNewWorkAdded.connected", str));
        this.setState({ suscriptionNewWorkAdded: suscriptionTemp });
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
            console.debug({ PlotAddress, WorksAddress, networkId });
            if (!isOk) {
                console.error(`Network id '${networkId}' is incorrect. The correct network is '${NetworkIdToUse}'`);
            } else {
                // Contract Plot
                const contractPlot = new web3.eth.Contract(contractPlotAbi.abi, PlotAddress);
                // Contract Works
                const contractWorks = new web3.eth.Contract(contractWorksAbi.abi, WorksAddress);
                // Contract Dron
                const contractDron = new web3.eth.Contract(contractDronAbi.abi, DronAddress);

                this.setState({ contractPlot, contractWorks, contractDron });
            }
        } catch (err) {
            console.error({ method, err });
        }
    }

    // Functions

    addPlot = async (message, plotName, minHight, maxHight, pesticide) => {
        console.debug({ message, plotName, minHight, maxHight, pesticide });
        try {
            const account = this.state.account;
            await this.state.contractPlot.methods.addPlot(plotName, minHight, maxHight, pesticide).send({ from: account });
        } catch (err) {
            console.error("addPlot", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    addWork = async (message, plotId, dronId) => {
        console.debug({ message, plotId, dronId });
        try {
            const account = this.state.account;
            await this.state.contractWorks.methods.addWork(plotId, dronId).send({ from: account });
        } catch (err) {
            console.error("addWork", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    getShowAllOwnerPlots = async () => {
        const owner = this.state.account;
        const method = "getShowAllOwnerPlots";
        const message = `Get and show all plots of owner ${owner}`;
        console.debug({ method, message, owner });

        // Get number of plots what has this owner
        let numberOfPlotsByOwner = await this.state.contractPlot.methods.balanceOf(owner).call();
        numberOfPlotsByOwner = parseInt(numberOfPlotsByOwner);

        // Get id's of plots
        let ids = [];
        if (numberOfPlotsByOwner > 0) {
            for (let index = 0; index < numberOfPlotsByOwner; index++) {
                const plotId = await this.state.contractPlot.methods.tokenOfOwnerByIndex(owner, index).call();
                ids.push(parseInt(plotId));
            }
        }

        // Get info of plots
        let plots = [];
        if (ids.length > 0) {
            for (let index = 0; index < numberOfPlotsByOwner; index++) {
                const id = ids[index];
                const plot = await this.state.contractPlot.methods.getPlotInfo(id).call();
                plots.push(plot);
            }
            this.setState({ ownerPlots: plots });
        }
    }

    showPlotToWork = async (message, plotId) => {
        console.debug({ message, plotId });
        // Reset selected dron
        this.setState({
            dronToWork: {
                id: 0
            }
        })
        try {
            const plots = this.state.ownerPlots;
            let plot = undefined;
            for (let i = 0; i < plots.length; i++) {
                if (parseInt(plots[i].id) === plotId) {
                    plot = plots[i];
                    break;
                }
            }

            if (plot !== undefined) {
                this.setState({
                    plotToWork: {
                        id: plot.id,
                        owner: this.state.account,
                        allowedMaximumFlightHeight: plot.allowedMaximumFlightHeight,
                        allowedMinimumFlightHeight: plot.allowedMinimumFlightHeight,
                        allowedPesticide: plot.allowedPesticide
                    }
                });
                this.showDronsAllowedToWorkPlot();
            } else {
                this.setState({
                    plotToWork: {
                        id: 0,
                        owner: "",
                        allowedMaximumFlightHeight: 0,
                        allowedMinimumFlightHeight: 0,
                        allowedPesticide: ""
                    }
                });
                this.setState({
                    allDrons: [],
                    filteredDrons: []
                });
            }
        } catch (err) {
            console.error("showPlotToWork", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    showDronToWork = async (message, dronId) => {
        console.debug({ message, dronId });
        try {
            const drons = this.state.filteredDrons;
            const owners = this.state.dronOwners;
            let dron = undefined;
            let owner = undefined;
            for (let index = 0; index < drons.length; index++) {
                if (parseInt(drons[index].id) === dronId) {
                    dron = drons[index];
                    owner = owners[index];
                    break;
                }
            }

            if (dron !== undefined) {
                const price = this.tokenRemoveDecimals(dron.price);
                this.setState({
                    dronToWork: {
                        id: dron.id,
                        owner: owner,
                        minimumFlightHeight: dron.maximumFlightHeight,
                        maximumFlightHeight: dron.minimumFlightHeight,
                        price: price
                    }
                });
            } else {
                this.setState({
                    dronToWork: {
                        id: 0,
                        owner: "",
                        minimumFlightHeight: 0,
                        maximumFlightHeight: 0,
                        price: 0
                    }
                });
            }
        } catch (err) {
            console.error("showDronToWork", err);
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    getAllDrons = async () => {
        const method = "getAllDrons";
        const message = "Get all drons";
        console.debug({ method, message });

        // Get number of drons in system
        let numberOfDrons = await this.state.contractDron.methods.totalSupply().call();
        numberOfDrons = parseInt(numberOfDrons);
        console.debug("drons", { numberOfDrons });

        // Get id's of drons
        let ids = [];
        if (numberOfDrons > 0) {
            for (let index = 0; index < numberOfDrons; index++) {
                const dronId = await this.state.contractDron.methods.tokenByIndex(index).call();
                ids.push(parseInt(dronId));
            }
        }

        // Get info of drons
        let drons = [];
        let dronOwners = [];
        if (ids.length > 0) {
            for (let index = 0; index < numberOfDrons; index++) {
                const dronId = ids[index];
                const dron = await this.state.contractDron.methods.getDronInfo(dronId).call();
                const owner = await this.state.contractDron.methods.ownerOf(dronId).call();
                drons.push(dron);
                dronOwners.push(owner);
            }
            this.setState({ allDrons: drons, dronOwners });
        }
    }

    showDronsAllowedToWorkPlot = async () => {
        await this.getAllDrons();
        // Filter from all drons, allowed to this specific work plot
        let drons = [];
        const plot = this.state.plotToWork;
        const allDrons = this.state.allDrons;
        console.debug("filter drons", allDrons);
        if (allDrons.length > 0 && plot && parseInt(plot.id) > 0) {
            for (let index = 0; index < allDrons.length; index++) {
                const dron = allDrons[index];
                if (parseInt(dron.id) === 0) continue;

                // Check plot and dron data

                // ERROR: The minimum flight height above the plot is higher than the maximum flight height of the drone!
                if (dron.maximumFlightHeight < plot.allowedMinimumFlightHeight) continue;
                // ERROR: The maximum flight height over the plot is lower than the minimum flight height of the drone!
                if (dron.minimumFlightHeight > plot.allowedMaximumFlightHeight) continue;
                // ERROR: The type of pesticide used by the drone is not compatible with this plot!
                if (dron.pesticide !== plot.allowedPesticide) continue;

                // Push data
                drons.push(dron);
            }
        }
        console.debug("filtered drons for selected plot", drons);
        this.setState({ filteredDrons: drons });
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

    tokenRemoveDecimals(tokenPrice) {
        const price = parseInt(tokenPrice) / Math.pow(10, TokenDecimals);
        return price;
    }

    // Render de la DApp
    render() {

        let plotSelectors = [];
        const plots = this.state.ownerPlots;
        plotSelectors.push(<option value="0" key="0">-------------------</option>);
        for (let i = 0; i < plots.length; i++) {
            plotSelectors.push(<option value={plots[i].id} key={plots[i].id}>#{plots[i].id}: {plots[i].name}</option>);
        }

        let dronSelectors = [];
        const drons = this.state.filteredDrons;
        if (drons) {
            dronSelectors.push(<option value="0" key="0">-------------------</option>);
            for (let i = 0; i < drons.length; i++) {
                const price = this.tokenRemoveDecimals(drons[i].price);
                dronSelectors.push(<option value={drons[i].id} key={drons[i].id}>#{drons[i].id}: {drons[i].name} ({price} FDT)</option>);
            }
        }

        const dronSelect = this.state.plotToWork.id > 0 && this.state.filteredDrons.length > 0 && (
            <>
                <select name="dronId" id="dronId" className='form-control mb-1' onChange={(event) => {
                    event.preventDefault();
                    const message = "Selected dron to work...";
                    const dronId = parseInt(event.target.value);
                    this.showDronToWork(message, dronId);
                }
                }>
                    {dronSelectors}
                </select>

                <label><b>Wallet propietario del dron:</b> {this.state.dronToWork.owner}</label><br />
                <label><b>Altura máxima de vuelo:</b> {this.state.dronToWork.minimumFlightHeight}</label><br />
                <label><b>Altura mínima de vuelo:</b> {this.state.dronToWork.maximumFlightHeight}</label><br />
                <label><b>Total a pagar:</b> {this.state.dronToWork.price} FDT</label><br />
            </>
        );

        const plotNotSelected = this.state.plotToWork.id === 0 && (
            <div className='div-warning'>No hay ninguna parcela seleccionada</div>
        )

        const dronNotSelected = this.state.plotToWork.id > 0 && this.state.filteredDrons.length > 0 && this.state.dronToWork.id === 0 && (
            <div className='div-warning'>No hay ningun dron seleccionado</div>
        )

        const noAdequateDrones = this.state.plotToWork.id > 0 && this.state.filteredDrons.length === 0 && (
            <div className='div-warning'>No hay drones adecuados, segun los parámetros de la parcela</div>
        )

        const buttonNewWork = this.state.plotToWork.id > 0 && this.state.dronToWork.id > 0 && (
            <>
                <input type="submit"
                    className='bbtn btn-block btn-warning btn-sm'
                    value='SOLICITAR SERVICIO' />
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

                                <h1>Area de clientes</h1>
                                <p><b>Contrato de las parcelas:</b> {PlotAddress}<br />
                                    <b>Contrato de los trabajos:</b> {WorksAddress}<br />
                                    <b>Contrato del token:</b> {FumigationDronTokenAddress}
                                </p>
                                <h2>Alta de parcelas y alquiler de drones</h2>

                                <a href="https://www.linkedin.com/in/antonpolenyaka/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <p> </p>
                                    <img src={centralImage} width="530" height="321" alt="" />
                                </a>
                                <p></p>

                                <h3><Icon circular inverted color='green' name='bars' /> Registro de una parcela</h3>

                                <form className='txt-h-start' onSubmit={(event) => {
                                    event.preventDefault()
                                    const plotName = this.plotName.value;
                                    const minHight = parseInt(this.minHight.value);
                                    const maxHight = parseInt(this.maxHight.value);
                                    const pesticide = parseInt(this.pesticide.value);
                                    const message = "Register plot..."
                                    this.addPlot(message, plotName, minHight, maxHight, pesticide)
                                }
                                }>
                                    <label><b>Wallet propietario:</b> {this.state.account}</label>

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Nombre de parcela"
                                        ref={(input) => this.plotName = input} />

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Altura mínima de vuelo permitida"
                                        ref={(input) => this.minHight = input} />

                                    <input type="text"
                                        className='form-control mb-1'
                                        placeholder="Altura máxima de vuelo permitida"
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

                                    <input type="submit"
                                        className='bbtn btn-block btn-success btn-sm'
                                        value='REGISTRAR PARCELA' />
                                </form>

                                <h3><Icon circular inverted color='orange' name='money bill alternate outline' /> Solicitar el servicio de fumigación</h3>
                                <form className='txt-h-start' onSubmit={(event) => {
                                    event.preventDefault();
                                    const plotId = this.state.plotToWork.id;
                                    const dronId = this.state.dronToWork.id;
                                    const message = "Create new work for plot by dron...";
                                    this.addWork(message, plotId, dronId);
                                }
                                }>
                                    <select name="plotId" id="plotId" className='form-control mb-1' onChange={(event) => {
                                        event.preventDefault();
                                        const message = "Selected plot to work...";
                                        const plotId = parseInt(event.target.value);
                                        this.showPlotToWork(message, plotId);
                                    }
                                    }>
                                        {plotSelectors}
                                    </select>

                                    <label><b>Wallet propietario de parcela:</b> {this.state.plotToWork.owner}</label><br />
                                    <label><b>Altura máxima de vuelo permitida:</b> {this.state.plotToWork.allowedMaximumFlightHeight}</label><br />
                                    <label><b>Altura mínima de vuelo permitida:</b> {this.state.plotToWork.allowedMinimumFlightHeight}</label><br />
                                    <label><b>Pesticida de la parcela:</b> {this.pesticideToString(this.state.plotToWork.allowedPesticide)}</label><br />

                                    {dronSelect}
                                    {buttonNewWork}
                                    {plotNotSelected}
                                    {dronNotSelected}
                                    {noAdequateDrones}
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

export default Clients