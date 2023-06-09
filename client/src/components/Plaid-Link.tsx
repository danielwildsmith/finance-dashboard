// APP COMPONENT
// Upon rendering of App component, make a request to create and
// obtain a link token to be used in the Link component
import React, {useEffect, useState} from "react";
import {usePlaidLink} from "react-plaid-link";
import Button from "@mui/material/Button";
import axios from "axios";
import { getJWT } from "./pages/auth";

const App = ({
  username,
  accountLinked,
}: {
  username: string;
  accountLinked: boolean;
}) => {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    const generateToken = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/user-tokens/create/${username}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getJWT()}`,
            },
          }
        );
        const data = await res.json();
        setLinkToken(data.link_token);
      }
      catch(error) {
        console.error(error);
      }
    };

    generateToken();
  }, []);

  return linkToken != null ? (
    <Link
      linkToken={linkToken}
      username={username}
      accountLinked={accountLinked}
      idToken={getJWT()}
    />
  ) : (
    <></>
  );
};

// LINK COMPONENT
// Use Plaid Link and pass link token and onSuccess function
// in configuration to initialize Plaid Link
interface LinkProps {
  linkToken: string | null;
  username: string;
  accountLinked: boolean;
  idToken: any;
}

const Link: React.FC<LinkProps> = (props: LinkProps) => {
  // @ts-ignore
  const onSuccess = React.useCallback((public_token, metadata) => {
    const tokenReq = {public_token: public_token};
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/user-tokens/set/${props.username}`,
        tokenReq, { headers: {"Authorization" : `Bearer ${props.idToken}`} }
      )
      .then((res) => {
        const req = {access_token: res.data, start_date: '2010-01-01'};

        // Create an array of axios requests
        const requests = [
          axios.post(
            `${process.env.REACT_APP_API_URL}/api/transactions/${props.username}`,
            req, { headers: {"Authorization" : `Bearer ${props.idToken}`} }
          ),
          axios.post(
            `${process.env.REACT_APP_API_URL}/api/balances/${props.username}`,
            req, { headers: {"Authorization" : `Bearer ${props.idToken}`} }
          ),
        ];

        // Wait for all requests to resolve
        Promise.all(requests)
          .then((responses) => {
            console.log("Transaction seeding: success");
            console.log("Balance seeding: success");
            const isSuccess = responses.every(
              (response) => response.status === 200
            );
            if (isSuccess) {
              document.cookie =
                "isAccountLinked=true" + "; path=/; SameSite=Lax";
            }
            window.location.reload();
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      })
      .catch((error) => {
        console.error("Failed on external axios Link post:", error.message);
      });
  }, []);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const {open, ready} = usePlaidLink(config);
  return (
    <Button
      onClick={props.username === "sample" ? () => null : () => open()}
      disabled={!ready}
      sx={{
        "backgroundColor": "black",
        "color": "#f6f7f9",
        "border": "none",
        "padding": 1.5,
        "paddingRight": 10,
        "paddingLeft": 10,
        "borderRadius": 5,
        ":hover": {backgroundColor: "#1a1e24", color: "#139eca"},
      }}
    >
      {props.accountLinked ? "Link Another Account" : "Link An Account"}
    </Button>
  );
};

export default App;
