import express from "express";
const port = process.env.PORT || 8081;
const app = express();
import { WorkOS } from "@workos-inc/node";
app.use(express.json());
const workos = new WorkOS(process.env.WORKOS_API_KEY, {
  clientId: process.env.WORKOS_CLIENT_ID,
});
import * as jose from "jose";

async function handleRequest(req, res) {
  try {
    switch (req?.body?.stage) {
      case "RouterRequest":
        const payload = req.body;
        const auth = req.body?.headers?.authorization[0];
        const decodedToken = jose.decodeJwt(auth);
        const user = await workos.userManagement.getUser(decodedToken.sub);

        payload.context.entries.email = user.email;
        
        res.send(payload);
    }
  } catch (error) {
    console.error("Error handling request:", error);
    res.send({
      control: { break: 401 },
      body: {
        errors: [
          {
            message: "Not authenticated.",
            extensions: {
              code: "ERR_UNAUTHENTICATED",
            },
          },
        ],
      },
    });
  }
}

app.post("/", handleRequest);

app.listen(port, () => {
  console.log(`🚀 Coprocessor running on port ${port}`);
});
