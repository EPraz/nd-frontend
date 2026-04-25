import { Redirect, useLocalSearchParams } from "expo-router";

function Create() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  return (
    <Redirect
      href={`/projects/${String(projectId)}/vessels/${String(assetId)}/fuel`}
    />
  );
}

export default Create;
