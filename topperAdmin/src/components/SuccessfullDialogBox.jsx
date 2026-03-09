import { Dialog, styled } from "@mui/material";
import React, { useState } from "react";
import DepartmentalUsesButton from "./botton/DepartmentalUsesButton";
import { NavLink } from "react-router-dom";

const SuccessfullDialogBox = ({ open, onClose, successImage, text, to }) => {
  return (
    <Dialog
      PaperProps={{
        sx: {
          width: "400px",
          maxWidth: "90%",

          borderRadius: "30px",
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
      open={open}
      onClose={onClose}
    >
      <DialogContentContainer>
        <img src={successImage} alt="success" />
        <p style={{alignItems:"center",padding:"0px 8px 0px 30px "}}>{text}</p>
        <NavLink to={to}>
          {" "}
          <DepartmentalUsesButton text="Continue" color="#0D6A84" />
        </NavLink>
      </DialogContentContainer>
    </Dialog>
  );
};

export default SuccessfullDialogBox;

const DialogContentContainer = styled("div")`
  height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  @media (max-width: 100vw) {
    width: 100%;
  }
`;
