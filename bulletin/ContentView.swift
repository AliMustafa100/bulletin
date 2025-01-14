//
//  ContentView.swift
//  bulletin
//
//  Created by Ali Mustafa on 1/8/25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            
            // Image of the Globe
            Image(systemName: "pencil")
                .imageScale(.large)
                .foregroundStyle(.tint)
            // Text Label Code
            Text("Hello, wordl!")
                .bold()
                
        }
        .padding()
    }
}

#Preview {
    ContentView()
}


//Vstack stands for vertical meaning a vertical stack

// Image and Text bascially is stacked on top of eachother

// the functions are basically modifiers with dot options scaler(.property) 
