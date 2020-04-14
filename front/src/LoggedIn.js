import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

//TODO:
//toiminnallisuus sinänsä

const DropDowns = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [buttonText, setButtonText] = useState("Vahvista saapuminen");
  const [buttonColor, setButtonColor] = useState("white");
  let id = props.d;
  
  const styleB = {
    left:270,
    position:"absolute"

  }
  const buttonStyle = {
    backgroundColor:`${buttonColor}`
  }
  const discardChanges = {
    color:"lightgray"
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const HandleClose = (event) => {
    //välitettävä tieto infossa ja päivämäärä id:ssa
    //jos info tyhjä ei varmennettavaa valvontaa kys päivälle
    console.log(event.currentTarget.dataset.info, id);
    
    if(event.currentTarget.dataset.info==="") {
      setButtonText("Vahvista saapuminen")
      setButtonColor("white");
    }
    if(event.currentTarget.dataset.info==="y") {
      setButtonText("Saavun paikalle")
      setButtonColor("green");
    }
    if(event.currentTarget.dataset.info==="n") {
      setButtonText("En pääse paikalle");
      setButtonColor("red");
    }
    setAnchorEl(null);
  }
  
  return (
    <span style={styleB}>
      
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        style={buttonStyle}>
        {buttonText}
      </Button>
      
      <Menu
        id={props.d}
        open={Boolean(anchorEl)}
        keepMounted
        anchorEl={anchorEl}
        onClose={HandleClose}>
        
        <MenuItem
          onClick={HandleClose}
          data-info=""
          style={discardChanges}>
          Vahvista saapuminen
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="y">
          Saavun paikalle
        </MenuItem>
        
        <MenuItem
          onClick={HandleClose}
          data-info="n">
          En pääse paikalle
        </MenuItem>

      </Menu>

      &nbsp;
      {props.d===props.today ?
       <Check HandleChange={props.HandleChange} />
       : "" }

    </span>
  )
}

const Check = ({HandleChange}) => {
  return (
    <>
      <FormControlLabel control={<Checkbox
                                   style={{color:"orange"}}
                                   onChange={HandleChange}
                                 />}
                        label="Matkalla" />
    </>
  )
}


const Rows = (props) => {
  const styleA = {
    padding:30,
    marginLeft:30,
    flexDirection:"row",
    display:"inline-flex",
    fontSize:18
  }
  
  //print drop down menus for selected days in a week
  
  let today = "Maanantai 3.4.2020";
  
  return (
    props.dates.map(d =>
                    <div key={d} style={styleA}>
                      {d}
                <DropDowns d={d} today={today} HandleChange={props.HandleChange} />
              </div>              
             )
  )
}

const DialogWindow = () => {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  let dates = ["Maanantai 3.4.2020", "Tiistai 4.4.2020", "Keskiviikko 5.4.2020"]
  
  console.log("checked", checked);
  
  const HandleChange = (event) => {
    //checked kertoo onko käyttäjä matkalla
    setChecked(!checked)
  }
  
  const HandleClose = () => {
    setOpen(false)
    //tietojen välitys

  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={()=> setOpen(false)}
        aria-labelledby="otsikko"
        maxWidth='sm'
        fullWidth={true}>
        
        <DialogTitle id="otsikko">Valvonnat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Varmista päävalvojan saapuminen:
          </DialogContentText>
        </DialogContent>


        <Rows HandleChange={HandleChange}
              dates={dates} />

        <DialogActions>
          <Button onClick={HandleClose}>
            Ok
          </Button>
        </DialogActions>

      </Dialog>
    </div>
  )
}

export default DialogWindow
