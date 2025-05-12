# Introduction 

👋 Welcome!

[Apollo’s Rover CLI](https://www.apollographql.com/docs/rover) uses this repository to initialize a [graph](https://www.apollographql.com/docs/concepts/graphs). Running Rover's [`init`](https://www.apollographql.com/docs/rover/commands/init) command provides a structured setup for managing and orchestrating APIs efficiently.

# Prerequisites

## Install the Rover CLI
Rover is the primary command-line interface for GraphOS—a necessary tool to interact with graphs using Apollo. If you’ve already installed Rover, you can skip this section.

### MacOS/Linux
```
curl -sSL https://rover.apollo.dev/nix/latest | sh
```

### Windows
```
iwr 'https://rover.apollo.dev/win/latest' | iex
```

## Install and configure the recommended extensions

### For schema development

#### VS Code
🔗 [Install Apollo's VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo)
🔗 [GraphQL development in VS Code](https://www.apollographql.com/docs/graphos/schema-design/ide-support/vs-code)

#### JetBrains
🔗 [Install Apollo's JetBrains plugin](https://plugins.jetbrains.com/plugin/20645-apollo-graphql)
🔗 [Schema development in JetBrains IDEs](https://www.apollographql.com/docs/graphos/schema-design/ide-support/jetbrains)

#### Vim/NeoVim
🔗 [Schema development in Vim and NeoVim](https://www.apollographql.com/docs/graphos/schema-design/ide-support/vim)

### For YAML files

#### VS Code
🔗 [Install Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

## Initialize a new project
```
rover init
```

📓 **Note:** If you’re already logged into an existing Apollo organization by the time you run this command, the CLI will nudge you to go to Apollo Studio. From there, you can create a new personal API key to interact with Rover. If you don’t have an account yet, visiting the link will prompt you to create one.
