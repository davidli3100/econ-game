import { Card, Dot, Text } from "@geist-ui/react";
import React from "react";

const Stat = ({label, stat}) => (
  <Card hoverable>
    <Text h3 size="2rem">{stat}</Text>
    <p>{label}</p>
  </Card>
)

const Admin = () => {
  return (
    <>
      <Text h2>
        Admin Page <Dot className="admin-dot-indicator">27 Users</Dot>
      </Text>
      <div className="admin-content">
        <div className="admin-quickstats">
          <Stat stat="+89" label="Societal Score" />
          <Stat stat="$3004" label="Average Cash" />
        </div>
      </div>
    </>
  )
}

export default Admin;