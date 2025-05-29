// import select2 from ""
import Select from 'react-select'
import { useState } from 'react';


export default function UserTabP(){
    const [selectedUsers, setSelectedUsers] = useState([]);
    const users = [
        { value: '1', label: 'User 1' },
        { value: '2', label: 'User 2' },
        { value: '3', label: 'User 3' },
    ];
    return <>
        <label htmlFor="">Selectionner l'utilisateur :</label>
        <Select 
            isMulti
            options={users}
            value={selectedUsers}
            onChange={setSelectedUsers}
        />
    </>
}