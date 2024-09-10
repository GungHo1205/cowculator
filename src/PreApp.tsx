// PasswordPage.tsx
import React, { useState } from "react";
import {
  Container,
  Title,
  TextInput,
  Button,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
interface PasswordPageProps {
  onAuthenticate: () => void; // Expecting a function to be passed in
}
const passKey = import.meta.env.VITE_PASSWORD_KEY;
const PasswordPage: React.FC<PasswordPageProps> = ({ onAuthenticate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const form = useForm({
    initialValues: {
      password: "",
    },
    validate: {
      password: (value) => (value === passKey ? null : "Invalid password"),
    },
  });

  const handleSubmit = (values: { password: string }) => {
    if (values.password === passKey) {
      setIsAuthenticated(true);
      onAuthenticate(); // Call the onAuthenticate function on successful authentication
    }
  };

  if (isAuthenticated) {
    return null; // Or redirect to another page or show the authenticated content
  }

  return (
    <Container
      size="xs"
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        margin: 0,
      }}
    >
      <Paper variant="lg" shadow="xs" style={{ width: "100%", maxWidth: 400 }}>
        <Title order={2} align="center" mb="md">
          Enter Password
        </Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              {...form.getInputProps("password")}
              placeholder="Your password"
              type="password"
              size="md"
              required
            />
            <Button type="submit" size="lg" fullWidth>
              Submit
            </Button>
            {form.errors.password && (
              <Text color="red" align="center">
                {form.errors.password}
              </Text>
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default PasswordPage;
