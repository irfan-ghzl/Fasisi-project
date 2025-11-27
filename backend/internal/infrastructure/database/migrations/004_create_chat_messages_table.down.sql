-- Drop index
DROP INDEX IF EXISTS idx_chat_messages_sender_receiver;

-- Drop chat_messages table
DROP TABLE IF EXISTS chat_messages CASCADE;
