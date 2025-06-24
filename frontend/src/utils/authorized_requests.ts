function getJWT(): string {
  const result = localStorage.getItem("jwt");
  if (!result) {
    throw new Error("Could not find JWT");
  }
  return result;
}

export async function getAuthorized(endpoint: string, queryParams: Record<string, string>) {
  const query = new URLSearchParams(queryParams).toString();
  const url = query ? `${endpoint}?${query}` : endpoint;
  console.debug(url.toString());
  return await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    }
  })
}

export async function websocketAuthorized(endpoint: string) {
  return new WebSocket(endpoint, [localStorage.getItem("userId")!, getJWT()]);
}
