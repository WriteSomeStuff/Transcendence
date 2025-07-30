import { FastifyRequest, FastifyReply } from "fastify";
import { removeUser } from "../authService.ts";

export const handleUserDbError = async (
  response: Response,
  userId: number,
  reply: FastifyReply,
) => {
  console.error("Error registering the user:", response.statusText);

  console.log(`[Auth Controller] Removing user ${userId} from db`);
  await removeUser(userId);
  console.log(`[Auth Controller] Removing user ${userId} from db successful`);

  const errorMsg =
    response.status === 409
      ? "Username already exists"
      : "Failed to update user service database:" + response.statusText;

  reply.status(response.status).send({
    success: false,
    error: errorMsg,
  });
};

export const handleSuccessfulLogin = async (
  request: FastifyRequest,
  reply: FastifyReply,
  userId: number,
) => {
  try {
    const token = request.jwt.sign({ userId: userId }, { expiresIn: "1d" });
    console.log(`[Auth Controller] JWT signed for '${userId}'`);

    reply.setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      secure: "auto",
      sameSite: "strict",
    });
    reply.setCookie("logged_in", "true", {
      path: "/",
      httpOnly: false,
      secure: "auto",
      sameSite: "strict",
    });
    console.log(`[Auth Controller] Cookie set for user '${userId}'`);

    console.log(
      `[Auth Controller] Setting status to 'online' for user '${userId}'`,
    );
    // const response = await setStatusInUserService(userId, "online");

    // if (!response.ok) {
    //   reply.status(response.status).send({
    //     success: false,
    //     error: response.statusText,
    //   });
    // }
    // console.log(
    //   `[Auth Controller] Set status to 'online' for user '${userId}'`,
    // );
  } catch (e) {
    console.error();
    reply.status(500).send({
      success: false,
      error: "An error occurred handling the login: " + e,
    });
  }
};

export const handleAuthInvalidation = async (
  _request: FastifyRequest,
  reply: FastifyReply,
  userId: number,
) => {
  try {
    reply.clearCookie("access_token", {
      path: "/",
      httpOnly: true,
      secure: "auto",
      sameSite: "strict",
    });
    reply.clearCookie("logged_in", {
      path: "/",
      httpOnly: false,
      secure: "auto",
      sameSite: "strict",
    });
    console.log(`[Auth Controller] Cookie erased for user '${userId}'`);

    console.log(
      `[Auth Controller] Setting status to 'offline' for user '${userId}'`,
    );
    // const response = await setStatusInUserService(userId, "offline");

    // if (!response.ok) {
    //   reply.status(response.status).send({
    //     success: false,
    //     error: response.statusText,
    //   });
    // }
    // console.log(
    //   `[Auth Controller] Set status to 'offline' for user '${userId}'`,
    // );
  } catch (e) {
    console.error();
    reply.status(500).send({
      success: false,
      error: "An error occurred handling the auth invalidation: " + e,
    });
  }
};
