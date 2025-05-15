export const USER_STATUS = {
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE'
  };
  
  export const CONNEXION_TYPES = {
    TYPE_0: 'TYPE_0',
  };
  
  export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
  };
  
  export const USER_VERIFICATION = {
    NO: 'NO',
    YES: 'YES'
  };
  
  export const mapUserResponse = (userResponse) => ({
    id: userResponse.id,
    firstName: userResponse.firstName,
    lastName: userResponse.lastName,
    username: userResponse.username,
    email: userResponse.email,
    phone: userResponse.phone,
    profilePicture: userResponse.profilePicture,
    isVerified: userResponse.isVerified === 'YES',
    status: userResponse.status,
    role: userResponse.role,
    theme: userResponse.theme,
    isDeleted: userResponse.isDeleted,
    createdAt: new Date(userResponse.createdAt),
    updatedAt: new Date(userResponse.updatedAt),
    authorities: userResponse.authorities.map(auth => auth.authority),
    
    // Propriétés Spring Security
    accountNonExpired: userResponse.accountNonExpired,
    accountNonLocked: userResponse.accountNonLocked,
    credentialsNonExpired: userResponse.credentialsNonExpired,
    enabled: userResponse.enabled
  });