import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent, CardHeader, Container, Drawer } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import FilterListIcon from "@material-ui/icons/FilterList";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles({
    drawer: {
        position: "relative",
        marginLeft: "auto",
        "& .MuiBackdrop-root": {
            display: "none"
        },
        "& .MuiDrawer-paper": {
            width: '50%',
            position: "absolute",
            backgroundColor: '#2C2D34',
            height: props => props.height,
            transition: "none !important"
        }
    },
    iconColor: {
        color: '#CECECE'
    }
});

export default function BasicTable(props) {
    const [open, setOpen] = useState(false);
    const [height, setHeight] = useState(0);

    const classes = useStyles({ height: height });

    useEffect(() => {
        if (open) {
            setHeight(props.height);
        } else {
            setHeight(0);
        }
    }, [open]);

    return (
        <React.Fragment>
            <div style={{ position: 'absolute', right: 0 }}>
                <IconButton className={classes.iconColor} onClick={() => { setOpen(true) }} >
                    <FilterListIcon />
                </IconButton>
            </div>
            <Drawer
                open={open}
                className={classes.drawer}
                variant="persistent"
                anchor="right"
            >
                <CardHeader
                    action={
                        <IconButton onClick={() => { setOpen(false) }} className={classes.iconColor}>
                            <CloseIcon />
                        </IconButton>
                    } />
                {props.children}
            </Drawer>
        </React.Fragment>
    );
}