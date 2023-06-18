import React from "react"
import MiniDrawer from "./menu"

export const PageLayout = ({ ContentComponent, page, isLinked }: {ContentComponent: React.ElementType, page: string, isLinked: boolean}) => {
    return (
     <div style={{display: 'flex', minWidth: 0}}>
          <MiniDrawer page={page} isLinked={isLinked}/>
          <div style={{ minWidth: 0, flexGrow: 1, marginTop: '10vh', padding: '6px' }}>
            <ContentComponent />
          </div>
      </div>
    ) 
}