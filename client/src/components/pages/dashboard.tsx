import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getIDToken, getUsername, isLoggedIn} from "./auth";
import {DashboardCards} from "../dashboard-cards";
import {PageLayout} from "../page-layout";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [accountLinked, setAccountLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccountLinkedStatus = async () => {
      try {
        const idToken = await getIDToken();
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user-tokens/${getUsername()}`, { headers: {"Authorization" : `Bearer ${idToken}`} }
        );
        const isLinked = res.data > 0;
        setAccountLinked(isLinked);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    if (!isLoggedIn()) {
      navigate("/");
    }
    checkAccountLinkedStatus();
  }, []);

  const Content = () => {
    return (
      <DashboardCards
        accountLinked={accountLinked || getUsername() === "sample"}
      />
    );
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{color: "#139eca"}} />
      </div>
    );
  }

  return (
    <PageLayout
      page={"Dashboard"}
      isLinked={accountLinked || getUsername() === "sample"}
      ContentComponent={Content}
    />
  );
};
