import { ProfilesState } from "./state";

export const selectFilteredProfiles =
  (input: string) => (state: ProfilesState) => {
    if (!input) {
      return Object.values(state.profiles);
    }

    const lowerCaseInput = input.toLowerCase().trim();

    return Object.values(state.profiles).filter(
      (profile) =>
        profile.name.toLowerCase().trim().includes(lowerCaseInput) ||
        profile.username.toLowerCase().trim().includes(lowerCaseInput) ||
        profile.account.toLowerCase().trim().includes(lowerCaseInput)
    );
  };
