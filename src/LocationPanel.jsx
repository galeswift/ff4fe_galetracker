import { React, useState } from 'react'
import { Flex, Text, Heading} from '@radix-ui/themes';
function BossLocations()
{
return <Flex direction="column">
    <Heading>Bosses</Heading>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
</Flex>;
}

function ObjectiveLocations()
{
    return <Flex direction="column">
    <Heading>Bosses</Heading>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
</Flex>;
}

function CharacterLocations()
{
    return <Flex direction="column">
    <Heading>Bosses</Heading>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
</Flex>;
}

function ChestLocations()
{
    return <Flex direction="column">
    <Heading>Bosses</Heading>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
    <Text>Valvalis</Text>
</Flex>;
}
export function LocationPanel()
{
    
    return  <Flex align="center" justify="center" gap="3">
      <BossLocations/>
      <ObjectiveLocations/>
      <CharacterLocations/>
      <ChestLocations/>
    </Flex>
    
}
