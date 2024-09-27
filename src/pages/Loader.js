import { Spinner, Center } from "@chakra-ui/react";

const Loader = () => {
  return (
    <Center h="100vh">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
};

export default Loader;
