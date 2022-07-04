import React from 'react';
import { Menu, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <Menu stackable>

            <Button color='blue' as={Link} to='/'>
                Compra/Venta de Tokens FDT (ERC-20)
            </Button>

            <Button color='green' as={Link} to='/clients'>
                Clientes (parcelas)
            </Button>

            <Button color='orange' as={Link} to='/firms'>
                Empresas (drones)
            </Button>

            <Button color='linkedin' href="https://www.linkedin.com/in/antonpolenyaka/" target="_blank">
                <Icon name='linkedin' /> LinkedIn
            </Button>

            <Button color='violet' href="https://github.com/antonpolenyaka" target="_blank">
                <Icon name='github' /> GitHub
            </Button>

        </Menu>
    );
}


