SELECT policyname, tablename, cmd, qual::text
FROM pg_policies
WHERE tablename IN ('wio_members','workflow_tasks','agent_messages')
ORDER BY tablename, policyname;
