FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY ["book-service.csproj", "./"]
RUN dotnet restore "book-service.csproj"
COPY . .
RUN dotnet build "book-service.csproj" -c Release -o /out

FROM build AS publish
RUN dotnet publish "book-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN apt-get update && apt-get install -y libgssapi-krb5-2 libstdc++6 && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "book-service.dll"]