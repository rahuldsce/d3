import React from 'react';
import { Card, IconButton } from '@material-ui/core'
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import Tooltip from './Tooltip'
import Sunburst from './Sunburst'
import './index.css'
import Sequence from './SequenceFunnel';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                <div style={{ backgroundColor: '#202125', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} align="center">
                    <Card style={{ width: 800, height: 800, backgroundColor: '#2C2D34', position: 'relative' }}>
                        <Tooltip height={800}>
                            <Sequence />
                        </Tooltip>
                        <Sunburst />
                    </Card>
                </div>
            </React.Fragment>
        );
    }


}

export default App