import { useUserStore } from "@/entities/user";
import { API_URL } from "@/shared/config";
import { logger } from "@/shared/lib/logger";
import { IUser } from "@/shared/lib/type/user.type";
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FC, ReactNode, useEffect, useState } from "react";

export interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const { isOpen, onOpen } = useDisclosure();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUserStore();
  const toast = useToast();

  useEffect(() => {
    const url = API_URL + "/api/v1/user/info";

    (async (url: string) => {
      const res = await fetch(url, {
        headers: {
          Authorization: "Basic " + localStorage.getItem("token"),
        },
      });

      if (res.status !== 200) {
        onOpen();
      } else {
        const data = (await res.json()) as IUser;
        logger.success("Logged in:", data);
        setUser(data);
      }
    })(url);
  }, []);

  const auth = async () => {
    const url = API_URL + "/api/v1/user/info";
    const token = btoa(login + ":" + password);

    const res = await fetch(url, {
      headers: {
        Authorization: "Basic " + token,
      },
    });

    if (res.status !== 200) {
      toast({
        status: "error",
        title: "Ошибка авторизации",
        description: "Неправильный логин или пароль",
      });
    } else {
      localStorage.setItem("token", token);
      location.reload();
    }
  };

  return (
    <>
      <Modal onClose={() => {}} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Авторизация</ModalHeader>
          <ModalBody display="grid" gap={2}>
            <Box>
              <Text>Логин:</Text>
              <Input
                value={login}
                onChange={({ target: { value } }) => setLogin(value)}
              />
            </Box>
            <Box>
              <Text>Пароль:</Text>
              <Input
                value={password}
                onChange={({ target: { value } }) => setPassword(value)}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => auth()}>Войти</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {children}
    </>
  );
};

export { AuthProvider };
