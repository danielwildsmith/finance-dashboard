import React from "react"
import MiniDrawer from "./components/sidebar"

export const PageLayout = ({ ContentComponent, page, isLinked }: {ContentComponent: React.ElementType, page: string, isLinked: boolean}) => {
    return (
      <div style={{display: 'flex'}}>
          <MiniDrawer page={page} isLinked={isLinked}/>
          <div style={{ flexGrow: 1, padding: '6px' }}>
            <div style={{ marginTop: '10vh' }}>
                <ContentComponent />
            </div>
          </div>
      </div>
    ) 
}