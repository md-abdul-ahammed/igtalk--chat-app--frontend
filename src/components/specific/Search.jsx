import { useInputValidation } from "6pp";
import { Search as SearchIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "../../redux/api/api";
import { setIsSearch } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";

const Search = () => {
  const { isSearch } = useSelector((state) => state.misc);
  const { user } = useSelector((state) => state.auth);
  const [addedStatus, setAddedStatus] = useState({});

  const [searchUser] = useLazySearchUserQuery();

  const [sendFriendRequest, isLoadingSendFriendRequest] = useAsyncMutation(
    useSendFriendRequestMutation
  );

  const dispatch = useDispatch();

  const search = useInputValidation("");

  const [users, setUsers] = useState([]);

  const addFriendHandler = async (id) => {
    const responseData = await sendFriendRequest("Sending friend request...", {
      userId: id,
    });

    console.log(responseData.message);

    if (responseData?.success) {
      console.log("Friend request sent successfully");
      setAddedStatus((prevStatus) => ({
        ...prevStatus,
        [id]: true, // Set added status for this user to true
      }));
    } else if (responseData?.message === "Request already sent") {
      console.log("Request already sent");
      setAddedStatus((prevStatus) => ({
        ...prevStatus,
        [id]: true, // Set added status for this user to true
      }));
    }
  };

  const searchCloseHandler = () => dispatch(setIsSearch(false));

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      searchUser(search.value)
        .then(({ data }) => setUsers(data.users))
        .catch((e) => console.log(e));
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [search.value]);

  return (
    <Dialog open={isSearch} onClose={searchCloseHandler}>
      <Stack p={"2rem"} direction={"column"} width={"25rem"}>
        <DialogTitle textAlign={"center"}>Find People</DialogTitle>
        <TextField
          label=""
          value={search.value}
          onChange={search.changeHandler}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <List>
          {users
            .filter((u) => u._id !== user._id)
            .map((i) => (
              <UserItem
                user={i}
                key={i._id}
                isAdded={addedStatus[i._id]} // Pass added status for this user
                handler={addFriendHandler}
                handlerIsLoading={isLoadingSendFriendRequest}
              />
            ))}
        </List>
      </Stack>
    </Dialog>
  );
};

export default Search;
