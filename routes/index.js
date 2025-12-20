import { Router } from "express";
import { PrismaClient } from "../generated/prisma/client.ts";
import {
  get_user,
  login_post,
  sign_up_post,
} from "../controllers/userController.js";
import {
  create_conversation_one_to_one_post,
  create_conversation_one_to_many_post,
  get_conversation_with_messages,
  get_user_conversations,
} from "../controllers/conversationController.js";
import {
  create_message_post,
  delete_message,
  update_message_put,
} from "../controllers/messageController.js";
const prisma = new PrismaClient();

const router = Router();

router.get("/users/user", get_user);
router.post("/users/signup", sign_up_post);
router.post("/users/login", login_post);

router.post(
  "/conversations/create_conversation_one_to_one_post",
  create_conversation_one_to_one_post
);
router.post(
  "/conversations/create_conversation_one_to_many_post",
  create_conversation_one_to_many_post
);
router.get("/conversations/get_user_conversations", get_user_conversations);
router.get("/conversations/get_conversation", get_conversation_with_messages);

router.post("/messages/create", create_message_post);
router.put("/messages/update", update_message_put);
router.delete("/messages/delete", delete_message);

export default router;
